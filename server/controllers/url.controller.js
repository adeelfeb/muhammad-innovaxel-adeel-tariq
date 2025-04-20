import { asyncHandler } from "../utils/asyncHandler.js";
import Url from "../models/url.model.js";
import { nanoid } from 'nanoid';
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";  
import config from "../config/conf.js";

// --- Helper function for basic URL validation ---
function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

// --- Helper function to generate unique short codes ---
async function generateUniqueShortCode(length = 7) {
  let shortCode;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;  

  while (!isUnique && attempts < maxAttempts) {
    shortCode = nanoid(length);
    const existing = await Url.findOne({ shortCode }).lean();  
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new ApiError(500, "Failed to generate a unique short code after multiple attempts");
  }
  return shortCode;
}


// --- Controller Functions ---



export const createShortUrl = asyncHandler(async (req, res) => {
    const { url } = req.body;

    if (!url) {
        throw new ApiError(400, "URL is required");
    }

    if (!isValidHttpUrl(url)) {
        throw new ApiError(400, "Invalid URL format. Must start with http:// or https://");
    }

    const existingUrl = await Url.findOne({ originalUrl: url }).lean();

    if (existingUrl) {
        return res.status(200).json(
            new ApiResponse(200, {
                id: existingUrl._id,
                url: existingUrl.originalUrl,
                shortCode: existingUrl.shortCode,
                shortUrl: `${config.BASE_URL}/${existingUrl.shortCode}`,
                createdAt: existingUrl.createdAt,
                updatedAt: existingUrl.updatedAt
            }, "Short URL already exists")
        );
    }

    const shortCode = await generateUniqueShortCode();

    const newUrl = await Url.create({
        originalUrl: url,
        shortCode: shortCode
    });

    const createdUrl = await Url.findById(newUrl._id).lean();

    if (!createdUrl) {
         throw new ApiError(500, "Something went wrong while creating the short URL");
    }

    return res.status(201).json(
        new ApiResponse(201, {
            id: createdUrl._id,
            url: createdUrl.originalUrl,
            shortCode: createdUrl.shortCode,
            shortUrl: `${config.BASE_URL}/${createdUrl.shortCode}`,
            createdAt: createdUrl.createdAt,
            updatedAt: createdUrl.updatedAt
        }, "Short URL created successfully")
    );
});




export const renderHomePage = asyncHandler(async (req, res) => {
    let fetchedUrls = [];  

    fetchedUrls = await Url.find({})
                           .sort({ createdAt: -1 })
                           .lean();  

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`; 
    const urlsWithFullShortUrl = fetchedUrls.map(url => ({
        ...url,
        fullShortUrl: `${baseUrl}/${url.shortCode}`  
    }));

    res.render('index', {
        title: 'URL Shortener - History',  
        shortUrlResult: null,          
        errorResult: null,             
        urls: urlsWithFullShortUrl     
    });
});

export const renderErrorPage = asyncHandler(async (req, res) => {
    res.render('error', {
        title: 'An Error Occurred',
        message: 'A general error page was requested or an operation failed.'
    });
});



// --- IMPORTANT: Function for redirection Currenlty not working ---

export const redirectToOriginalUrl = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    // console.log("The data received in the redirect fucntion:", shortCode)

    if (!shortCode) {
        return res.status(404).render('error', {  
            title: 'Not Found',
            message: 'Short code is missing in the URL.'
        });
    }

    const urlDoc = await Url.findOne({ shortCode: shortCode });  

    if (urlDoc) {
        urlDoc.accessCount += 1;  
        await urlDoc.save({ validateBeforeSave: false });
        // console.log("Now redirecting")
        return res.redirect(302, urlDoc.originalUrl);  
    } else {
        return res.status(404).render('error', {  
           title: 'Not Found',
           message: `The short URL '${shortCode}' was not found.`
       });
    }
});




export const getOriginalUrlData = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    // console.log("The shortCode recveived is:", shortCode)
    if (!shortCode) {
         throw new ApiError(400, "Short code parameter is required");
    }
    
    const urlDoc = await Url.findOne({ shortCode: shortCode })
        .select('id originalUrl shortCode createdAt updatedAt') // Exclude accessCount
        .lean();
    
    if (!urlDoc) {
        throw new ApiError(404, "Short URL not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200, {
             id: urlDoc._id,
             url: urlDoc.originalUrl,
             shortCode: urlDoc.shortCode,
             createdAt: urlDoc.createdAt,
             updatedAt: urlDoc.updatedAt
        }, "URL data retrieved successfully")
    );
    });


