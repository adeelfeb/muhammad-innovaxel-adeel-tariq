import { asyncHandler } from "../utils/asyncHandler.js";  

export const renderHomePage = asyncHandler(async (req, res) => {
    res.render('index', { 
        title: 'URL Shortener',
        shortUrlResult: null,
        errorResult: null
    });
});
 
export const renderErrorPage = asyncHandler(async (req, res) => {
    res.render('error', {
        title: 'An Error Occurred',  
        message: 'A general error page was requested.'  
    });
});
