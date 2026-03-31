import multer from "multer"

const Storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public/temp")
    },
    filename: function(req, file, cd){
        cb(null, file.originalname)
    }
})

export const upload = multer({
    Storage,
})