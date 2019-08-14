const fill_pdf = require('fill-pdf-utf8');
const fs = require('fs');
const Jimp = require('jimp');
const PDFImage = require("pdf-image").PDFImage;

let generatePDFForm = function(object, signature) {

    return new Promise(function (resolve, reject) {

        let oneCard = "";
        let twoCard = "";

        if(object.number_card_applied === "1") {
            oneCard = "X"
        }

        if(object.number_card_applied === "2") {
            twoCard = "X"
        }

        let cardNumberSplit = object.cardNumber.split("");


        let fields = {
            name_in_english : object.name_in_english,
            name_in_japanese : "-",
            nationality : object.nationality,
            date_of_birth : object.date_of_birth,
            passport_number : object.passport_number,
            passport_issued_place : object.passport_issued_place,
            passport_issued_date : object.passport_issued_date,
            passport_expiry_date : object.passport_expiry_date,
            residential_address : object.residential_address,
            correspondence_address : "-",
            date_applied : object.date_applied,
            phone_number : object.phone_number,
            phone_number_home : "-",
            email_address : object.email_address,
            one_card_checkbox : oneCard,
            two_card_checkbox : twoCard,
            individual_card_checkbox : "X",
            card_chars_1 : cardNumberSplit[0],
            card_chars_2 : cardNumberSplit[1],
            card_chars_3 : cardNumberSplit[2],
            card_chars_4 : cardNumberSplit[3],
            card_chars_5 : cardNumberSplit[4],
            card_chars_6 : cardNumberSplit[5],
            card_chars_7 : cardNumberSplit[6],
            card_chars_8 : cardNumberSplit[7],
            card_chars_9 : cardNumberSplit[8],
            card_chars_10 : cardNumberSplit[9],
            card_chars_11 : cardNumberSplit[10],
            card_chars_12 : cardNumberSplit[11],
            card_chars_13 : cardNumberSplit[12],
            card_chars_14 : cardNumberSplit[13],
            card_chars_15 : cardNumberSplit[14],
            card_chars_16 : cardNumberSplit[15]
        };

        console.log(fields);

        let d = new Date();
        let random = d.getTime();

        let PDFFilePath = __dirname + '/test/form/' + random + '-form.pdf';
        let PDFFilePathXFDF = __dirname + '/test/form/' + random + '-form.xfdf';
        let signatureCrop = __dirname + '/test/cropped/' + random + '.png';


        // let fileNamePNG = __dirname + '/upload/edited/' + conversionCtrl.untokenizer(object.cardOne).card_no +'-form.png';


        fill_pdf.generatePdf({fields: fields}, __dirname + '/test/form.pdf','need_appearances', PDFFilePath, function (error, stdout, stderr) {
            if(error){
                console.log(error);
                reject({ status : 'error', response : 'something_went_wrong' });
            } else {

                fs.createReadStream(PDFFilePath);
                fs.statSync(PDFFilePath);

                let pdfImage = new PDFImage(PDFFilePath, {
                    convertOptions: {
                        "-resize": "2160x2160",
                        "-quality": "100",
                        "-density" : "150",
                        "-flatten" : "",
                        "-sharpen" : "0x1.0"
                    }
                });

                pdfImage.convertFile()
                    .then(function (imagePaths) {
                        console.log("success1");
                        // console.log("success");
                        console.log(imagePaths[0], signature);

                        Jimp.read(imagePaths[0])
                            .then(image1 => {

                                Jimp.read(signature)
                                    .then(image2 => {
                                        image2.autocrop();
                                        image2.scale(1);
                                        image2.resize(120,120);

                                        image2.write(signatureCrop, function () {

                                            image1.composite( image2, 500, 1780 );

                                            image1.write(imagePaths[0], function () {

                                                fs.unlink(signatureCrop, (err) => {
                                                    if (err) throw err;

                                                    fs.unlink(PDFFilePath, (err) => {
                                                        if (err) throw err;

                                                        fs.unlink(PDFFilePathXFDF, (err) => {
                                                            if (err) throw err;

                                                            let renameFormFile = __dirname + "/test/form/" + random + '.png' ;

                                                            fs.rename(imagePaths[0], renameFormFile, function(err) {
                                                                if ( err ) {console.log('ERROR: ' + err)}

                                                                else {

                                                                    resolve({ status : 'success', response : 'created'});

                                                                }

                                                            });


                                                        });
                                                    });

                                                });

                                            });



                                        });

                                    })
                                    .catch(err2 => {
                                        // Handle an exception.
                                        reject("error generating pdf");
                                    });

                            })
                            .catch(err1 => {
                                // Handle an exception.
                                reject("error generating pdf");
                            });





                    })
                    .catch(function (err) {
                        console.log(err);
                    })




            }
        })





    });



};

let object = {
    name_in_english : "SHAFIQ JELANI",
    nationality : "MYS",
    date_of_birth : "17/06/1993",
    passport_number : "A50258513",
    passport_issued_place : "MALAYSIA",
    passport_issued_date : "21/02/2018",
    passport_expiry_date : "21/02/2028",
    residential_address : "135B, LORONG ASTANA 7/9, BANDAR SERI ASTANA, 08000 SUNGAI PETANI, KEDAH.",
    date_applied : "14/03/2019",
    phone_number : "+601110844378",
    email_address : "shafiqjelani93@gmail.com",
    number_card_applied : "1",
    cardNumber : "1234512345098776"
};

generatePDFForm(object, __dirname + '/test/A50258513-sign.jpg')
    .then(function (resultsGenerate) {

        console.log(resultsGenerate);

    });
