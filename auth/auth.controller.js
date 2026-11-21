const service=require('./auth.service');
const {asyncRoute,fail}=require('../errors');
const {Router}=require('express');const {authenticate}=require('./auth.middleware');
const router=Router();
router.post('/login',asyncRoute(async(req,res)=>res.json(await service.login(req.body?.email,req.body?.password))));
router.post('/refresh',asyncRoute(async(req,res)=>{if(!req.body?.refreshToken)fail(400,'Refresh token obrigatório.');res.json(await service.refresh(req.body.refreshToken));}));
router.post('/logout',authenticate,asyncRoute(async(req,res)=>{await service.logout(req.body?.refreshToken);res.json({message:'Logout realizado.'});}));
router.get('/me',authenticate,(req,res)=>res.json(service.userPublic(req.user)));
module.exports=router;
