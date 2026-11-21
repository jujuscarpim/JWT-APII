const {User}=require('../models');const bcrypt=require('bcryptjs');const {fail,str,posId}=require('../errors');
const {userPublic}=require('../auth/auth.service');
async function list(){return (await User.findAll({order:[['name','ASC']]})).map(userPublic);}
async function create(body){
 const name=str(body.name,'Nome'),email=str(body.email,'E-mail'),username=str(body.username,'Usuário');
 const password=str(body.password,'Senha');if(password.length<6)fail(400,'Senha deve ter ao menos 6 caracteres.');
 const user=await User.create({name,email,username,password:await bcrypt.hash(password,10),isAdmin:body.isAdmin===true,active:true});return userPublic(user);
}
async function update(id,body){
 const user=await User.findByPk(posId(id,'ID'));if(!user)fail(404,'Atendente não encontrado.');
 const data={};for(const f of ['name','username','email'])if(body[f]!==undefined)data[f]=str(body[f],f);
 if(body.isAdmin!==undefined)data.isAdmin=Boolean(body.isAdmin);
 if(body.password){if(body.password.length<6)fail(400,'Senha muito curta.');data.password=await bcrypt.hash(body.password,10);}
 await user.update(data);return userPublic(user);
}
async function setActive(id,active,actorId){const user=await User.findByPk(posId(id,'ID'));if(!user)fail(404,'Atendente não encontrado.');if(user.id===actorId&&!active)fail(409,'Não desative sua própria conta.');await user.update({active:Boolean(active)});return userPublic(user);}
module.exports={list,create,update,setActive};
