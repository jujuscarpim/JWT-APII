const {Reader}=require('../models');const {str}=require('../errors');const crud=require('../crud');
module.exports=crud({Model:Reader,validate:b=>({name:str(b.name,'Nome'),cpf:str(b.cpf,'CPF').replace(/\D/g,''),email:str(b.email,'E-mail',false),phone:str(b.phone,'Telefone',false)}),allowWriteForStaff:true});
