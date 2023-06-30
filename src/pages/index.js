import Head from 'next/head'
import { useState} from "react";
import { Box, Button, Center, Input, InputGroup, InputLeftElement, SimpleGrid, Spacer, Stack, Text, Textarea} from '@chakra-ui/react';

import { FaPenNib} from "react-icons/fa";
import { getCompletions } from '@/lib/openai-completions';

let ROLE_PLAY = `与えられた文章を用いて、ウィットに飛んだオノマトペを一つ返してください。その際、オノマトペは造語で「スパスパ」や「ゴムゴム」のように単語を２回並べて作ってください。`

export default function Home() {
  const [botmessage, setBotmessage] = useState();
  const [roleplay, setRoleplay] = useState(ROLE_PLAY);
  const [chat, setChat] = useState([]);

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
        <SimpleGrid columns={{base:1, sm: 1, md: 1, lg: 1}} spacing={10}>
          <Box ml={5} mr={5}>
            <Spacer mt={5}/>
            <Stack spacing={4}>
              <Center>
                <Text>なんでもオノマトペで返してくれるBOT</Text>
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
                const reply = await getCompletions(chat, roleplay);
                setBotmessage(reply);
            
                setChat("");
              }}>
                送信
              </Button>
            </Stack>
          </Box>
          <Spacer mt={5}/>
        </SimpleGrid>      
      </Box>
    </>
  )
}
