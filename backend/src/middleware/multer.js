import multer from "multer";

const uploadProfileImage = multer({
    //datoteku privremeno drzim u memoriji prije slanja u storage
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5*1024*1024, //najvise 5MB
        files: 1
    },
    fileFilter: (req, file, callback) => {
        const dozvoljeniTipovi = ["image/jpeg", "image/png", "image/webp"];
        
        if(dozvoljeniTipovi.includes(file.mimetype)) {
            return callback(null, true);    //javljamo multeru da prihvacamo file
        }

        const error = new Error("Please select a JPG, PNG, or WebP image.");
        error.status= 400;
        callback(error);
    }
});

export default uploadProfileImage;