exports.error500=(req,res)=>{
    res.status(500).render('500',{
        pageTitle:'Error',
        path:'/500',
        isAuthenticateed:req.session.isLoggedIn
    })
}