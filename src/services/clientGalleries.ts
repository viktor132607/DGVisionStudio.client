export type {
    GalleryAccessDto,
    GrantGalleryAccessRequest,
    PagedResultDto,
    PortfolioAlbumDto,
    PortfolioCategoryDto,
    ReorderGalleryPhotosRequest,
    SetGalleryCoverRequest,
    UpdateGalleryAccessRequest,
} from "./clientGalleries/types"

export {
    deleteAdminPortfolioAlbum,
    getAdminPortfolioAlbums,
} from "./clientGalleries/portfolio"

export {
    createMyClientGallery,
    deleteMyClientGallery,
    getClientGalleryDetails,
    getMyClientGalleries,
    uploadMyClientGalleryPhoto,
} from "./clientGalleries/client"

export {
    createAdminClientGallery,
    deleteAdminClientGallery,
    getAdminClientGalleries,
    getAdminClientGalleryById,
    updateAdminClientGallery,
} from "./clientGalleries/admin"

export {
    getGalleryAccesses,
    grantGalleryAccess,
    removeGalleryAccess,
    updateGalleryAccess,
} from "./clientGalleries/access"

export {
    deleteGalleryPhoto,
    reorderGalleryPhotos,
    setGalleryCoverImage,
    updateGalleryPhoto,
    uploadGalleryPhoto,
} from "./clientGalleries/media"

export {
    getAdminGalleryPhotoDownloadUrl,
    getGalleryPhotoDownloadUrl,
    getGalleryZipDownloadUrl,
} from "./clientGalleries/downloads"
