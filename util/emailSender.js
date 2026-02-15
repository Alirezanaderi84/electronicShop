// const nodemailer=require('nodemailer')
// const sendEmail= async(option)=>{
//     var transport = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io",
//   port: 587,
//   auth: {
//     user: "404a7ca34c1d94",
//         pass: "****7b16"
//   }
// });
// const emailOption={
//     from:'alireza.naderi.haghighi.1384@gmail.com',
//     to:'test@gmail,com',
//     subject:option.subject,
//     text:option.text
// }
// await transport.sendMail(emailOption)

// }


const nodemailer = require('nodemailer');
const sendEmail=(option=>{
   
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }

    console.log('Credentials obtained, sending message...');


const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'marjorie26@ethereal.email',
        pass: 'efpfpcyN7s2kycG3D3'
    }
});

 
    let message = {
        from: 'test@gmail.com',
        to:option.email ,
        subject: option.subject,
        html:option.html
    };

    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
        }

        console.log('Message sent: %s', info.messageId);
      
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
});

})
 module.exports=sendEmail
