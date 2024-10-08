const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async(req, res) => {
    const allListing = await Listing.find({});
    res.render("./listings/index.ejs", { allListing } );
};
 
module.exports.renderNewform =(req,res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate: {path: "author"}})
    .populate("owner");
    if(!listing) {
     req.flash("error", "listing is not exist ");
     return res.redirect("/listings");
    };
    console.log(listing)
    res.render("./listings/show.ejs" , { listing });
};

module.exports.createListing = async (req, res, next) => {
    try {
        const newListing = new Listing(req.body.listing);
        let savedlisting = await newListing.save();
        console.log(savedlisting);
        req.flash("success", "New listing is created");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};

  
module.exports.renderEditform = async (req,res) => { 
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
      req.flash("error", "listing is not exist ");
     return res.redirect("/listings");
     };

     let originalImageUrl = listing.image.url;
     originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("./listings/edit.ejs", { listing , originalImageUrl});
};
  
module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if (typeof req.file !== "undefined") { 
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();  
    };
    req.flash("success", " listing is updated");
    res.redirect(`/listings/${id}`);
}; 

module.exports.deleteListing = async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "new listing is deleted");
    res.redirect("/listings");
};