const jwt=require('jsonwebtoken');const bcrypt=require('bcryptjs');const crypto=require('crypto');
const {db,User,RefreshToken}=require('../models');const {fail}=require('../errors');
const accessTtl=()=>Math.max(10,Number(process.env.ACCESS_TTL_SECONDS)||900);
function userPublic(user){return {id:user.id,name:user.name,email:user.email,username:user.username,isAdmin:user.isAdmin,active:user.active};}
function makeAccess(user){return jwt.sign({id:user.id,name:user.name,email:user.email,isAdmin:user.isAdmin},process.env.JWT_SECRET,{expiresIn:accessTtl()});}
function makeRefresh(user){return jwt.sign({id:user.id,jti:crypto.randomUUID(),type:'refresh'},process.env.JWT_REFRESH_SECRET,{expiresIn:'7d'});}
function hash(token){return crypto.createHash('sha256').update(token).digest('hex');}
async function issue(user,transaction){
 const refreshToken=makeRefresh(user);const decoded=jwt.decode(refreshToken);
 await RefreshToken.create({userId:user.id,token:hash(refreshToken),expiresAt:new Date(decoded.exp*1000),revoked:false},{transaction});
 return {accessToken:makeAccess(user),refreshToken,user:userPublic(user)};
}
async function login(email,password){
 const user=await User.findOne({where:{email}});
 if(!user||!user.active||typeof password!=='string'||!(await bcrypt.compare(password,user.password)))fail(401,'E-mail ou senha inválidos.');
 return issue(user);
}
async function refresh(token){
 let decoded;
 try{decoded=jwt.verify(token,process.env.JWT_REFRESH_SECRET);if(decoded.type!=='refresh')throw Error();}
 catch{fail(401,'Refresh token inválido ou expirado.');}
 // A transação serializa a rotação no SQLite. Reuso revoga todas as sessões.
 return db.transaction(async transaction=>{
  const record=await RefreshToken.findOne({where:{token:hash(token)},transaction});
  if(!record||record.userId!==decoded.id)fail(401,'Refresh token desconhecido.');
  if(record.revoked){await RefreshToken.update({revoked:true},{where:{userId:record.userId},transaction});return {reused:true};}
  if(record.expiresAt<new Date())fail(401,'Refresh token expirado.');
  const user=await User.findByPk(record.userId,{transaction});
  if(!user||!user.active)fail(401,'Usuário desativado.');
  await record.update({revoked:true},{transaction});
  return issue(user,transaction);
 }).then(result=>{if(result.reused)fail(401,'Reutilização detectada: sessões revogadas.');return result;});
}
async function logout(token){if(token)await RefreshToken.update({revoked:true},{where:{token:hash(token)}});}
module.exports={login,refresh,logout,userPublic};
