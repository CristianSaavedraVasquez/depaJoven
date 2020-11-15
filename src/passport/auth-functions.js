function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("back");
}

function checkNotAuthenticated(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('back');
}

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated
}
