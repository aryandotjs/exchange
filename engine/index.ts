import { createClient } from "redis"
import { Engine } from "./engine";


async function startEngine(){
    const client = createClient()
    client.connect();
    const engine = new Engine();
    
  while(true){
      const response = await client.rPop("messages")
      if (response) {
          engine.process(JSON.parse(response))
      }
  }
} 

startEngine()