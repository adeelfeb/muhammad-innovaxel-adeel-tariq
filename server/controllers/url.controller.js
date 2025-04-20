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
    try {
        const { url } = req.body;
    
        if (!url) {
            throw new ApiError(400, "URL is required");
        }
    
        if (!isValidHttpUrl(url)) {
            throw new ApiError(400, "Invalid URL format. Must start with http:// or https://");
        }
    
        const existingUrl = await Url.findOne({ originalUrl: url }).lean();

        
        
    
        if (existingUrl) {
            const generatedShortURL = `${config.BASE_URL}/${existingUrl.shortCode}`
            return res.status(200).json(
                new ApiResponse(200, {
                    id: existingUrl._id,
                    url: existingUrl.originalUrl,
                    shortCode: existingUrl.shortCode,
                    shortUrl: generatedShortURL,
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

        const newGeneratedShortURL = `${config.BASE_URL}/${createdUrl.shortCode}`
        console.log("The short url generated is:", newGeneratedShortURL)
    
        return res.status(201).json(
            new ApiResponse(201, {
                id: createdUrl._id,
                url: createdUrl.originalUrl,
                shortCode: createdUrl.shortCode,
                shortUrl: newGeneratedShortURL,
                createdAt: createdUrl.createdAt,
                updatedAt: createdUrl.updatedAt,
            }, "Short URL created successfully")
        );  
    } catch (error) {
        console.error("Error Creating Short URL: ", error.message)
        return res.status(500).render('error', {
            title: 'Error Creating Short URL',
            message: error.message
        });
    }
});




export const renderHomePage = asyncHandler(async (req, res) => {
    let fetchedUrls = [];

    try {
        fetchedUrls = await Url.find({})
            .select('_id shortCode originalUrl createdAt accessCount accessLog')
            .sort({ createdAt: -1 }) 
            .lean(); 

        const baseUrl = config.BASE_URL || `${req.protocol}://${req.get('host')}`;

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

    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).render('error', { 
            title: 'Server Error',
            message: 'Could not load URL history.'
        });
    }
});


export const renderErrorPage = asyncHandler(async (req, res) => {
    res.render('error', {
        title: 'An Error Occurred',
        message: 'A general error page was requested or an operation failed.'
    });
});



// --- IMPORTANT: Function for redirection Currenlty not working ---

export const redirectToOriginalUrl = asyncHandler(async (req, res) => {
    try {
        const { shortCode } = req.params;
        const accessorIp = req.ip; // Get IP from request
        // console.log('Request Headers:', req.headers);
        // console.log(`>>>Redirect request for ${shortCode} from IP: ${accessorIp}`);

        if (!shortCode) {
            return res.status(404).render('error', {
                title: 'Not Found',
                message: 'Short code is missing in the URL.'
            });
        }

        const urlDoc = await Url.findOne({ shortCode: shortCode });

        if (urlDoc) {
            urlDoc.accessCount += 1;
            
            if (!Array.isArray(urlDoc.accessLog)) {
                urlDoc.accessLog = [];
            } 

            urlDoc.accessLog.push({ ip: accessorIp });

            await urlDoc.save({ validateBeforeSave: false });

            return res.redirect(302, urlDoc.originalUrl);

        } else {
            return res.status(404).render('error', {
               title: 'Not Found',
               message: `The short URL '${shortCode}' was not found.`
           });
        }
    } catch (error) {
        console.error("Error Redirecting Short URL: ", error); 
        return res.status(500).render('error', {
            title: 'Error Redirecting Short URL',
            message: error.message
        });
    }
});



export const getOriginalUrlData = asyncHandler(async (req, res) => {
    try {
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
    } catch (error) {
        console.error("Error Fetching Original URL Details: ", error.message)
        return res.status(500).render('error', {
            title: 'Error Geting Original URL Details',
            message: error.message
        });
    }
    });


export const updateShortUrl = asyncHandler(async (req, res) => {
    try {
        const { shortCode } = req.params; 
        const { url: newOriginalUrl } = req.body;
    
        // --- VALIDATION ---
        if (!shortCode) {
            throw new ApiError(400, "Short code parameter is required");
        }
    
        if (!newOriginalUrl) {
            throw new ApiError(400, "New URL (key: 'url') is required in the request body");
        }
    
        if (!isValidHttpUrl(newOriginalUrl)) {
            throw new ApiError(400, "Invalid new URL format. Must start with http:// or https://");
        }
    
        // --- DATABASE OPERATION ---
        const updatedUrl = await Url.findOneAndUpdate(
            { shortCode: shortCode },
            { originalUrl: newOriginalUrl },
            { new: true, runValidators: true }
        ).select('id originalUrl shortCode createdAt updatedAt').lean();
    
        if (!updatedUrl) {
            throw new ApiError(404, "Short URL not found");
        }
    
        return res.status(200).json(
            new ApiResponse(200, {
                id: updatedUrl._id,
                url: updatedUrl.originalUrl,
                shortCode: updatedUrl.shortCode,
                createdAt: updatedUrl.createdAt,
                updatedAt: updatedUrl.updatedAt
            }, "Short URL updated successfully")
        );
    } catch (error) {
        console.error("Error Updating URL: ", error.message)
        return res.status(500).render('error', {
            title: 'Error Updating Short URL',
            message: error.message
        });
    }
});
    
    
    
export const deleteShortUrl = asyncHandler(async (req, res) => {
    try {
        const { shortCode } = req.params;
        if (!shortCode) {
                throw new ApiError(400, "Short code parameter is required");
        }
    
        const result = await Url.deleteOne({ shortCode: shortCode });
    
        if (result.deletedCount === 0) {
            throw new ApiError(404, "Short URL not found");
        }
    
        return res.status(200).json( 
                new ApiResponse(204, null, "Short URL deleted successfully")
        );
    } catch (error) {
        console.error("Error deleting Url: ", error.message)
        return res.status(500).render('error', {
            title: 'Error while deleting URL',
            message: error.message
        });
    }
    });


export const getShortUrlStats = asyncHandler(async (req, res) => {
    try {
        const { shortCode } = req.params;
        if (!shortCode) {
                throw new ApiError(400, "Short code parameter is required");
        }
    
        const urlDoc = await Url.findOne({ shortCode: shortCode })
            .select('id originalUrl shortCode createdAt updatedAt accessCount accessLog') // Include accessCount
            .lean();
    
        if (!urlDoc) {
            throw new ApiError(404, "Short URL not found");
        }
        // console.log("The accesss ips is:", urlDoc.accessLog)
    
            return res.status(200).json(
            new ApiResponse(200, {
                    id: urlDoc._id,
                    url: urlDoc.originalUrl,
                    shortCode: urlDoc.shortCode,
                    createdAt: urlDoc.createdAt,
                    updatedAt: urlDoc.updatedAt,
                    accessCount: urlDoc.accessCount, 
                    accessLog: urlDoc.accessLog
            }, "URL statistics retrieved successfully")
        );
    } catch (error) {
        console.error("Error Fetching url stats: ", error.message)
        return res.status(500).render('error', {
            title: 'Error Fetching Url Stats',
            message: error.message
        });
    }
    });