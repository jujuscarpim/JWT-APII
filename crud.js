const {Router}=require('express');const {asyncRoute,fail,posId}=require('./errors');
const {authenticate,isAdmin}=require('./auth/auth.middleware');
function crud({Model,fields,validate,checkDelete,allowWriteForStaff=false}){
 const r=Router();r.use(authenticate);
 r.get('/',asyncRoute(async(req,res)=>res.json(await Model.findAll({order:[['id','DESC']]}))));
 r.get('/:id',asyncRoute(async(req,res)=>{const one=await Model.findByPk(posId(req.params.id,'ID'));if(!one)fail(404,'Registro não encontrado.');res.json(one);}));
 const write=allowWriteForStaff?[]:[isAdmin];
 r.post('/',...write,asyncRoute(async(req,res)=>res.status(201).json(await Model.create(validate(req.body)))));
 r.put('/:id',...write,asyncRoute(async(req,res)=>{const one=await Model.findByPk(posId(req.params.id,'ID'));if(!one)fail(404,'Registro não encontrado.');res.json(await one.update(validate(req.body)));}));
 if(checkDelete)r.delete('/:id',...write,asyncRoute(async(req,res)=>{
  const one=await Model.findByPk(posId(req.params.id,'ID'));if(!one)fail(404,'Registro não encontrado.');await checkDelete(one);await one.destroy();res.json({message:'Excluído com sucesso.'});
 }));
 return r;
}
module.exports=crud;
