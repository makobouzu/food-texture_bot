import { Box, Stack, Text } from "@chakra-ui/react";

export default function ChatbotCard({ send, text, timestamp }) {
  return (
    <Box mt={5}>
      <Box ml={{base: 2, md: 3}} mr={{base: 12}} mb={2} display={"flex"} shadow="md" p={{base: 2, md: 3}} justifyContent="space-between" background={"white"} alignItems="center" borderRadius="md">
        <Text>
          {text}
        </Text>
        <Box pl={{base: 2, md: 5}} borderRadius="md" >
        <Text fontSize={{base: "10px", md: "12px"}}>
          {timestamp}
        </Text>
        </Box>
      </Box>
    </Box>
  )
}