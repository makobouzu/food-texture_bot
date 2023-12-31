import Head from 'next/head'
import { db } from '@/lib/firebase'
import { useEffect, useState} from "react";
import { collection, onSnapshot, orderBy, query} from 'firebase/firestore'
import { Box, Button, Center, Input, InputGroup, InputLeftElement, Spacer, Stack, Text} from '@chakra-ui/react';
import { FaPenNib} from "react-icons/fa";
import { getCompletions } from '@/lib/openai-completions';
import { getEmbeddings} from '@/lib/openai-embeddings';
import similarity from 'wink-nlp/utilities/similarity.js';
import Three from '@/components/datavisualization';
import Inner from '@/components/datavisualization';


let ROLE_PLAY = `与えられた文章を用いて、ウィットに飛んだオノマトペを日本語で一つ返してください。その際、オノマトペは必ず造語で「スパスパ」や「ゴムゴム」のように単語２個並べて4文字を作ってください。`
const data = [["test1", [0, 0]], ["test2", [1, 1]], ["test3", [2, 2]]];

export default function Home() {
  const [botmessage, setBotmessage] = useState();
  const [roleplay, setRoleplay] = useState(ROLE_PLAY);
  const [chat, setChat] = useState([]);
  const [dbcontent, setDbcontent] = useState([]);
  const [pos, setPos] = useState();

  useEffect(() => {
    const collectionRef = collection(db, "vector");
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
          <Box ml={15} mr={15}>
            <Spacer mt={5}/>
            <Stack spacing={4}>
              <Center>
                <Text as='mark'>なんでもオノマトペで返してくれるBOT</Text>
              </Center>
                <Spacer mt={5} />
              <Center>
                <Text fontSize='6xl'>{botmessage}</Text>
              </Center>
              <Spacer mt={20} />
              {/* <Center>
                <Textarea placeholder='プロンプトの設定をしてください。' value={roleplay} onChange={(e) => setRoleplay(e.target.value)} />
              </Center> */}
              <InputGroup>
                <InputLeftElement pointerEvents='none'>
                  <FaPenNib color='gray.300'/>
                </InputLeftElement>
                <Input placeholder='文章を入力してください。' value={chat} onChange={(e) => setChat(e.target.value)} />
              </InputGroup>
              <Button colorScheme='blue' onClick={async () => {
                if(chat != ""){
                  const reply = await getCompletions(chat, roleplay);
                  setBotmessage(reply);

                  const vector = await getEmbeddings(chat);

                  // 高次元での検索
                  let vecList = [];
                  dbcontent.map((msg, index) => {
                    const vectorSimilarity = similarity.bow.cosine(vector, msg.vector);
                    vecList.push([msg.text, vectorSimilarity, msg.xy]);
                  });
                  vecList.sort(function(first, second){
                    return first[1] - second[1];
                  });
                  const sliceList = vecList.slice(-4);
                  console.log(sliceList);
                  
                  // xy座標の割り出し
                  let sum = 0;
                  for(let i = 0; i < sliceList.length; ++i){
                    sum = sum + sliceList[i][1];
                  }
                  let xy = [0, 0];
                  for(let i = 0; i < sliceList.length; ++i){
                    xy[0] = xy[0] + sliceList[i][1]/sum * sliceList[i][2][0];
                    xy[1] = xy[1] + sliceList[i][1]/sum * sliceList[i][2][1];
                  }
                  console.log(xy)
                  setPos(xy);

                  // マッピング

            
                  setChat("");
                }
              }}>
                送信
              </Button>
            </Stack>
          </Box>
          <Spacer mt={5}/>
          <Three />
      </Box>
    </>
  )
}
