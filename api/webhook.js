const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "zuca-verify-2025";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";

const WELCOME_TEXT = "Olá! 😊 Sou seu assistente financeiro. Como posso te ajudar hoje?";
const NON_TEXT_TEXT = "Recebi sua mensagem, mas ainda não entendo áudio ou imagem. Me envie como texto. 😉";

export default async function handler(req, res){
  if(req.method==="GET"){
    const mode=req.query["hub.mode"];
    const token=req.query["hub.verify_token"];
    const challenge=req.query["hub.challenge"];
    if(mode==="subscribe" && token===VERIFY_TOKEN){ return res.status(200).send(challenge); }
    return res.status(403).send("Forbidden");
  }
  if(req.method==="POST"){
    try{
      const body=req.body;
      const message=body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      const from=message?.from; const type=message?.type;
      if(!from||!type){ return res.status(200).json({status:"no-message"}); }
      const replyText = type==="text" ? WELCOME_TEXT : NON_TEXT_TEXT;
      await sendWhatsappText(from, replyText);
      return res.status(200).json({status:"ok"});
    }catch(e){ console.error("webhook error:", e); return res.status(200).json({status:"error-caught"}); }
  }
  res.setHeader("Allow","GET, POST"); return res.status(405).send("Method Not Allowed");
}

async function sendWhatsappText(to, text){
  if(!WHATSAPP_TOKEN||!PHONE_NUMBER_ID){ return; }
  await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,{
    method:"POST",
    headers:{ Authorization:`Bearer ${WHATSAPP_TOKEN}`, "Content-Type":"application/json" },
    body: JSON.stringify({ messaging_product:"whatsapp", to, type:"text", text:{ body:text } })
  });
}
