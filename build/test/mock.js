const http=require('http');const states={};const games={};const KEY='test';
http.createServer((req,res)=>{const u=new URL(req.url,'http://x');const send=o=>{res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(o))};
 if(req.method==='GET'){if(u.searchParams.get('key')!==KEY)return send({error:'bad key'});const g=u.searchParams.get('game');if(g)return send({game:games[g]||null});return send({state:states[u.searchParams.get('user')||'majed']||null})}
 let b='';req.on('data',d=>b+=d);req.on('end',()=>{const j=JSON.parse(b);if(j.key!==KEY)return send({error:'bad key'});
  if(j.game){const c=j.game;const d=j.data;if(j.create){d.v=1;games[c]=d;return send({ok:true,game:d})}const cur=games[c];if(!cur)return send({error:'no room'});if(cur.v!==j.v)return send({ok:false,conflict:true,game:cur});d.v=cur.v+1;games[c]=d;return send({ok:true,game:d})}
  if(j.photo)return send({ok:true,url:'https://drive.example/x'});states[j.user||'majed']=j.state;send({ok:true})})}).listen(8767);
