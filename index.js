const {DataTypes, Sequelize} = require('sequelize')
const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { v4 } = require('uuid')
const cors = require('cors')
const sequelize = new Sequelize('postgres://marketplace_vnss_user:z2rxcm77KHhqhCF9iqeknBaR8dJImPuu@dpg-cot6ar2cn0vc73a76cbg-a/marketplace_vnss', {
    dialect: "postgres",
})

const publicPath = String(path.join(__dirname, "public"))

const User = sequelize.define("User",{
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        unique:true,
        primaryKey: true,
        autoIncrement: true
    },
    name: { 
        type: DataTypes.STRING, 
        allowNull: false,
        unique: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    profilePicture:{
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
    },
    city:{
        type: DataTypes.STRING,
        allowNull: false, 
        unique: false
    },
    sshKey:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    isstaff:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false
    }
})

const Product = sequelize.define("Product",{
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        unique:true,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    category: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false
    },
    prodImage:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false
    }
})

const Category = sequelize.define("Category",{
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        unique:true,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    image:{
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
    } 
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
  
      cb(null, publicPath);
    },
    filename: function (req, file, cb) {
        let image = file.originalname
        Product.findAll({where:{prodImage:image}}).then(async (prods) => {
            if (prods.length > 0){
                let img = image.split('.') 
                img[0] += `(${prods.length}).`
                image = img[0]+img[1]
            }
        }).then(()=>{
            cb(null, image);
        })
    },
}) 
  
const upload = multer({ storage: storage })

function checkUser(req,res,callback){
    let key = req.headers.key 
    if(key){
        User.findOne({where: {sshKey: key}}).then((user)=>{
            if(user){
                callback(user)
            } else {
                return res.status(404).json({
                    status:404,
                    message:"User not found"
                }) 
            }
        })
    } else {
        key = req.body.key
        if(key){
            User.findOne({where: {sshKey: key}}).then((user)=>{
                if(user){
                    callback(user)
                } else {
                    return res.status(404).json({
                        status:404,
                        message:"User not found"
                    }) 
                }
            })
        } else {
            return res.status(400).json({
                status:400,
                message:"Please enter key"
            }) 
        }
    }
}

sequelize.authenticate()
sequelize.sync()

const router = express()

router.use(express.json());
router.use(cors())
router.use(express.urlencoded({ extended: true }));

router.post('/user', (req, res) => {
    const name = req.body.name
    const email = req.body.email
    const phone = req.body.phone
    const password = req.body.password
    const profilePicture = req.body.profilePicture
    const city = req.body.city
    const isStaff = (req.body.isstaff === true)
    const key = v4()

    if (name != null){
        if (name.length < 3){

            return res.status(400).json({
                status: 400,
                message: 'name must be longer than 3 symbols'
            })
        }
    } else if(!name || name == null) {
        return res.status(400).json({
            status: 400,
            message: 'please enter name'
        })
    }
    
    if (phone != null){
        if (phone.length <= 0){
            return res.status(400).json({
                status: 400,
                message: 'please enter phone number'
            })
        }
    } else if(!phone || phone == null){
        return res.status(400).json({
            status: 400,
            message: 'please enter phone number'
        })
    }

    if (password != null){
        if (password.length <= 3){ 
            return res.status(400).json({
                status: 400,
                message: 'password must be longer than 3 symbols'
            })
        }
    } else  if(!password || password == null){
        return res.status(400).json({
            status: 400,
            message: 'please enter password'
        })
    }

    if (profilePicture != null){
        if (profilePicture.length <= 0){
            return res.status(400).json({
                status: 400,
                message: 'Please upload your profile picture'
            })
        }
    }
    
    if (city != null){
        if (city.length <= 0){
            return res.status(400).json({
                status: 400,
                message: 'Please enter your city'
            })
        }
    } else if(!phone || phone == null){
        return res.status(400).json({
            status: 400,
            message: 'Please enter your city'
        })
    }

    if (email != null){
        if (email.length <= 0){
            return res.status(400).json({
                status: 400,
                message: 'please enter email'
            })
        } else {
            User.findOne({where: {email : email}}).then((emailDb) => {
                if (emailDb != null){
                    emailStat = false
                    return res.status(403).json({
                        status: 403,
                        message: 'This email has been already used'
                    })
                } else {
                    User.create({name: name, email: email, phone: phone, password: password, profilePicture:profilePicture, city:city, sshKey:key,isstaff:isStaff}).then((user)=>{
                        return res.status(201).json({
                            status: 201,
                            message: 'successful',
                            key:user.dataValues.sshKey
                        })
                    })
                }
            })
        }
    } else if(!email || email == null){
        return res.status(400).json({
            status: 400,
            message: 'please enter email'
        })
    }
})
// Get user info
router.get('/user', (req, res) => {
    checkUser(req,res,(user)=>{
        return res.status(200).json({
            status:200,
            user:user.dataValues
        })
    })
})

// Get user`s products
router.get('/user/products',(req,res)=>{
    checkUser(req,res,(user)=>{
        Product.findAll({where:{userId:user.id}}).then((products)=>{
            if(!products){
                return res.status(404).json({
                    status:404,
                    message:"Products not found"
                })
            }
            return res.status(200).json({
                status:200,
                products:products
            })
        }) 
    })
})

// Check user registration
router.get('/userCheck', (req, res) => {
    const email = req.headers.email
    const password = req.headers.password
    console.log(email)
    console.log(password)
    if (!email){
        res.status(400).json({
            status: 400,
            message: 'Enter email' 
        })
    }
    if (!password){
        res.status(400).json({
            status: 400,
            message: 'Enter password'
        })
    }
    User.findOne({where:{email: email, password: password}}).then((user) => {
        if (user){
            return res.status(200).json({
                status:200,
                user:user.dataValues
            })
        } else {
            res.status(404).json({
                status: 404,
                message: 'No user were found'
            })
        }
    })
})

// All products
router.get('/products', (req, res) => {
     Product.findAll().then((products) => {
        if (products){
            return res.status(200).json({
                status:200,
                products:products
            })
        } else {
            return res.status(404).json({
                status:404,
                message:"No products were found"
            })
        }})
    }  
)

// Get all products by category
router.get('/products/:id', (req, res) => {
    if (req.params.id){
        const categoryId = Number(req.params.id)  
        if(`${categoryId}` != "NaN"){
            Category.findOne({where: {id: categoryId}}).then((category) => {
                if(category){
                    Product.findAll({where:{category:categoryId}}).then((products)=>{
                        if (products){
                            return res.status(200).json({
                                status:200,
                                products:products,
                                category:category.dataValues.name
                            })
                        } else {
                            return res.status(404).json({
                                status:404,
                                message:"No products in current category were found"
                            })
                        }
                    })
                } else {
                    return res.status(404).json({
                        status:404,
                        message:"Category not found"
                    })
                }
            })
        } else {
            return res.status(400).json({
                status:400,
                message:"Category id must be int"
            })
        }
    }
})

// Get one product 
router.get('/product/:id', (req, res) => {
    if(req.params.id){
        const productId = Number(req.params.id)
        if(`${productId}` != "NaN"){
            Product.findOne({where: {id: productId}}).then((product) => {
                if (product){
                    return res.status(200).json({
                        status:200,
                        product:product.dataValues
                    })
                } else {
                    return res.status(404).json({
                        status:404,
                        message:"No products were found"
                    })
                }   

            })
        } else {
            return res.status(400).json({
                status:400,
                message:"Product id must be int" 
            })
        }
    }
})

// Create one product with token check 
router.post('/product', upload.single('file'), (req, res) => {
    checkUser(req,res,(user)=>{
        const userId = user.dataValues.id
        const name = req.body.name
        const description = req.body.description     
        const price = req.body.price
        const categoryId = req.body.categoryId
        let image = req.file.originalname
        if (!categoryId){
            return res.status(400).json({ 
                status:400, 
                message:"Category id must exist"
            })
        } else {
             Category.findOne({where:{id:categoryId}}).then( async (category)=>{
                if(category){
                    if(!name){
                        return res.status(400).json({
                            status:400,
                            message:"Name must exist"
                        })
                    }
                    if(!description){
                        return res.status(400).json({
                            status:400,
                            message:"Description must exist"
                        })
                    }
                    if (!price){
                        return res.status(400).json({
                            status:400,
                            message:"Price must exist"
                        })
                    }
                    if (!image){
                        return res.status(400).json({
                            status:400,
                            message:"Image must exist"
                        })
                    }

                    Product.findAll({where:{prodImage:image}}).then(async (prods) => {
                        if (prods.length > 0){
                            let img = image.split('.') 
                            img[0] += `(${prods.length}).`
                            image = img[0]+img[1]
                        }
                        await Product.create({name:name,description:description,price:price,category:categoryId,prodImage:image,userId:userId}).then((product)=>{ 
                            return res.status(201).redirect("http://localhost:3001/products")
                        })
                    })
                } else {
                    return res.status(404).json({
                        status:404,
                        message:"No categories were found"
                    })
                }
            })
        }
    })
})

// Delete one product with token check
router.delete('/product/:id', (req, res) => {
    checkUser(req,res,(user)=>{
        const productId = Number(req.params.id)
        if(`${productId}` != "NaN"){
            Product.findOne({where: {id: productId}}).then((product) => {
                if (product){
                    if(product.dataValues.userId == user.dataValues.id){
                        Product.destroy({where: {id: productId}})
                        return res.status(200).json({
                            status:200,
                            message:"Product was successfully deleted"
                        })
                    } else {
                        return res.status(403).json({
                            status:403,
                            message:"Access denied"
                        })
                    }
                } else {
                    return res.status(404).json({
                        status:404,
                        message:"Product not found"
                    })
                }
            })
        } else {
            return res.status(400).json({
                status:400,
                message:"Product id must be int"
            })
        }
    })
})

router.post("/category",(req,res)=>{
    checkUser(req,res,(user)=>{
        if(user.isstaff){
            const name = req.body.name
            if(!name){
                return res.status(400).json({
                    status:400,
                    message:"Name must exist"
                })
            }
            Category.create({name:name})
        } else {
            return res.status(403).json({
                status:403,
                message:"Access denied"
            })
        }
    })
})

router.get('/public/:fileName', (req, res) => {
    const fileName = req.params.fileName
    const filePath = path.join(publicPath, fileName)
    fs.exists(filePath, (exists) =>{
        if (exists){
            res.sendFile(filePath)
        } else{
            res.status(404).send('File not found')
        }
    })
})

router.listen('3000')
