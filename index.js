require('dotenv').config();const express=require('express'),cors=require('cors'),bcrypt=require('bcryptjs');
const {db,User}=require('./models');const {handleErrors}=require('./errors');
const app=express();app.use(cors({origin:process.env.FRONT_ORIGIN||'http://localhost:3000',credentials:true}));app.use(express.json());
app.use('/v1/auth',require('./auth/auth.router'));
app.use('/v1/user',require('./user/user.router'));
app.use('/v1/categories',require('./category/category.router'));
app.use('/v1/authors',require('./author/author.router'));
app.use('/v1/books',require('./book/book.router'));
app.use('/v1/readers',require('./reader/reader.router'));
app.use('/v1/loans',require('./loan/loan.router'));
app.use('/v1/reports',require('./reports/reports.router'));
app.get('/',(req,res)=>res.json({message:'API Biblioteca online'}));app.use(handleErrors);
async function start(){
 if(!process.env.JWT_SECRET||!process.env.JWT_REFRESH_SECRET||process.env.JWT_SECRET===process.env.JWT_REFRESH_SECRET)throw new Error('Configure JWT_SECRET e JWT_REFRESH_SECRET diferentes no .env');
 await db.authenticate();await db.sync();
 // Migração simples para instalações anteriores que ainda não tinham campo active
 const columns=await db.getQueryInterface().describeTable('Users');
 if(!columns.active){const {DataTypes}=require('sequelize');await db.getQueryInterface().addColumn('Users','active',{type:DataTypes.BOOLEAN,defaultValue:true});}
 let admin=await User.findOne({where:{isAdmin:true}});
 if(!admin){const email=process.env.ADMIN_EMAIL||'admin@biblioteca.com';
  const exists=await User.findOne({where:{email}});
  if(exists){await exists.update({isAdmin:true,active:true});admin=exists;}
  else{admin=await User.create({name:'Administrador',username:'admin',email,password:await bcrypt.hash(process.env.ADMIN_PASSWORD||'123456',10),isAdmin:true,active:true});}
  console.log('Admin inicial criado/ativado:',admin.email);
 }
 app.listen(Number(process.env.PORT)||3001,()=>console.log('SERVIDOR RODANDO http://localhost:'+(process.env.PORT||3001)));
}
start().catch(e=>{console.error('Falha ao iniciar:',e);process.exit(1)});
