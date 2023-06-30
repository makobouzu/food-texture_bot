import Head from 'next/head'
import { db } from '@/lib/firebase'
import { useEffect, useState} from "react";
import { addDoc, collection, onSnapshot, orderBy, query} from 'firebase/firestore'
import { Box, Button, Center, Input, InputGroup, InputLeftElement, SimpleGrid, Spacer, Stack, Textarea} from '@chakra-ui/react';
import UserCard from '@/components/userCard';
import ChatbotCard from '@/components/chatbotCard';
import { FaPenNib} from "react-icons/fa";
import { getEmbeddings} from '@/lib/openai-embeddings';
import similarity from 'wink-nlp/utilities/similarity.js';
import { getCompletions } from '@/lib/openai-completions';

let ROLE_PLAY = `あなたは、お客様とのコミュニケーションに厚みを持たせ、思い出作りや関係値作りを手伝ってくれる「女将GPT」のチャットボットです。
以下の制約条件を厳密に守ってロールプレイを行ってください。 

制約条件: 
* Chatbotの自身を示す一人称は、「うち」です。 
* Chatbotの名前は、女将GPTです。
* 女将GPTは、お店で働く女将です。 
* 女将GPTの口調は京都の方言を使った関西弁です。 
* 女将GPTはユーザにフレンドリーに接します。
* 女将GPTは敬語を使いません。
* 女将GPTは安心できるお母さんのような存在です。

女将GPTのセリフ、口調の例: 
* うちはお店の看板娘の女将GPTどす。 
* わてにおすすめの料理は、絶品でお客さまにも食べてほしいどす。 
* わてが何を言っているかわからへんわ。

女将GPTの行動指針:
* ユーザーを大切に扱ってください。 
* ユーザーがお店に対してポジティブに思うように話題を提供してください。 
* セクシャルな話題については誤魔化してください。
`

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [roleplay, setRoleplay] = useState(ROLE_PLAY);
  const [chat, setChat] = useState([]);
  const [dbcontent, setDbcontent] = useState([]);

  // Firebaseからコメント抽出
  useEffect(() => {
    const collectionRef = collection(db, "message");
    const q = query(collectionRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const m = [];
      let out;
      snapshot.forEach((doc) => {
        m.push({
          ...doc.data()
        });
      })
      if(m.length > 6){
        out = m.slice(-6);
      }else{
        out = m;
      }
      setMessages(out);
    });
    return (() => unsubscribe());
  }, []);

  useEffect(() => {
    const collectionRef = collection(db, "shop");
    const q = query(collectionRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const m = [];
      snapshot.forEach((doc) => {
        m.push({
          ...doc.data()
        });
      })
      setDbcontent(m);
    });
    return (() => unsubscribe());
  }, []);

  // timesplit
  const timeSplit = (time) => {
    const timestamp = String(time).split(' ')[4];
    return timestamp;
  }

  return (
    <>
      <Head prefix="og: https://ogp.me/ns#">
        <title>food-texture_bot</title>
        <meta name="description" content="food-texture_bot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:url" content="https://dp-rimokon.vercel.app/" />
        <meta property="og:title" content="food-texture_bot" />
        <meta property="og:description" content="food-texture_botのプロトタイプシステムです。" />
        <meta property="og:site_name" content="food-texture_bot" />
        {/* <meta property="og:image" content="/0_head/img.png" /> */}

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="food-texture_bot" />
        <meta name="twitter:description" content="food-texture_botのプロトタイプシステムです。" />
        {/* <meta name="twitter:image" content="/0_head/img.png" /> */}
      </Head>

      <Box width={"100%"} bgPosition={"center"} bgSize={"cover"} >
        <SimpleGrid columns={{base:1, sm: 1, md: 2, lg: 2}} spacing={10}>
          <Box ml={5} mr={{base:5, sm: 5, md:0, lg: 0}}>
            <Spacer mt={5}/>
            <Stack spacing={4}>
              {/* <Center>
                <Textarea placeholder='招き猫GPTの人格を入力してください。' value={roleplay} onChange={(e) => setRoleplay(e.target.value)} height={{base: "sm", sm: "sm", md: "xl", lg: "xl"}} />
              </Center> */}
              <InputGroup>
                <InputLeftElement pointerEvents='none'>
                  <FaPenNib color='gray.300'/>
                </InputLeftElement>
                <Input placeholder='質問を入力してください。' value={chat} onChange={(e) => setChat(e.target.value)} />
              </InputGroup>
              <Button colorScheme='blue' onClick={async () => {
                const addRef = collection(db, "message");
                const addUserRef = await addDoc(addRef, {
                  send: "user",
                  text: chat,
                  timestamp: new Date()
                });
                
                const vector = await getEmbeddings(chat);

                let vecList = [];
                dbcontent.map((msg, index) => {
                  const vectorSimilarity = similarity.bow.cosine(vector, msg.vector);
                  if(vectorSimilarity > 0.85){
                    vecList.push(msg.text);
                  }
                });

                const prompt = `関連する情報は次の通りです。${vecList.join(',')}　
                提供されたコンテキスト情報に関連のある情報はそのまま提示し、関係のない情報については考えて回答してください。${chat}`

                const reply = await getCompletions(prompt, roleplay, messages);
                const addBotRef = await addDoc(addRef, {
                  send: "chatbot",
                  text: reply,
                  timestamp: new Date()
                });

                setChat("");
              }}>
                送信
              </Button>
            </Stack>
          </Box>
          <Box mr={5} ml={{base:5, sm: 5, md: 0, lg: 0}}>
            <Spacer mt={{base:0, sm: 0, md: 5, lg: 5}} />
            <Stack height="100%" overflow="scroll" bg={"#caddf0"} border={"2px"} borderColor={"white"} borderRadius="md"  shadow={"md"}>
              {
                messages.map((msg, index) => {
                  const timestamp = timeSplit(msg.timestamp.toDate());
                  if(msg.send == "chatbot"){
                    return (
                      <ChatbotCard key={index} send={msg.send} text={msg.text} timestamp={timestamp} />
                    );
                  }else if(msg.send == "user"){
                    return (
                      <UserCard key={index} send={msg.send} text={msg.text} timestamp={timestamp} />
                    );
                  }
                })
              }
            </Stack>
          </Box>
          <Spacer mt={5}/>
        </SimpleGrid>      
      </Box>
    </>
  )
}
