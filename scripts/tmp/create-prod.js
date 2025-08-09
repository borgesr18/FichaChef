(async()=>{
  const {PrismaClient}=require("@prisma/client");
  const prisma=new PrismaClient();
  try{
    const p=await prisma.produto.create({
      data:{
        nome:"Produto Teste",
        precoVenda:10.5,
        margemLucro:20,
        userId:"dev-user"
      }
    });
    console.log(JSON.stringify(p,null,2));
  }catch(e){
    console.error("ERR:",e);
    process.exitCode=1;
  }finally{
    await prisma.$disconnect();
  }
})();
