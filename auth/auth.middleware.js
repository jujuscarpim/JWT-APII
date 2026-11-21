const jwt=require('jsonwebtoken');const {User}=require('../models');
async function authenticate(req,res,next){
 const m=/^Bearer (.+)$/i.exec(req.headers.authorization||'');
 if(!m)return res.status(401).json({error:'Token não fornecido.'});
 try{
  const payload=jwt.verify(m[1],process.env.JWT_SECRET);
  const user=await User.findByPk(payload.id);
  if(!user||!user.active)return res.status(401).json({error:'Usuário inativo ou inexistente.'});
  req.user=user;next();
 }catch(err){return res.status(401).json({error:'Token inválido ou expirado.'});}
}
function isAdmin(req,res,next){if(!req.user.isAdmin)return res.status(403).json({error:'Somente administradores.'});next();}
module.exports={authenticate,isAdmin};
