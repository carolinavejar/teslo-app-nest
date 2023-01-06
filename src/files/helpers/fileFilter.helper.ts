export const FileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    callback: Function) => {
 
        if(!file) {
            return callback( new Error ('File is empty'), false);
        }

        const fileExtension = file.mimetype.split('/')[1];
        console.log("Filem extension: ", fileExtension);
        
        const validExtensions = ['jpg', 'png', 'jpeg'];

        console.log("validExtensions.includes( fileExtension ): ", validExtensions.includes( fileExtension ));
        
        if( validExtensions.includes( fileExtension )){
            return callback (null, true);
        }

        callback(null, false);
}