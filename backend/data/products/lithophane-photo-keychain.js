const product = {
  isActive: true,
  name: "Lithophane Photo Keychain",
  slug: "lithophane-photo-keychain",
  category: "Keychain",
  description: `
    - Customization: Choose a photo personalize your keychain.
    - Show photo when light in background.
    - Perfect Gift Idea: Ideal for gifting to friends, family, and loved ones on special occasions.
    - 3D printed with PLA: Made with durable and lightweight PLA bioplastic, this keychain is gentle on the environment.
    - Lightweight and compact: Easily attach it to your keys without adding bulk.
        
      `,
  mrp: 349,
  price: 199,
  mainImage: {
    imagePath: "products/lithophane-photo-keychain/38.png",
  },
  customizations: [
    {
      fieldType: "image",
      field: "image",
      label: "Upload Image",
      required: true,
      info: {
        aspectRatio: 1,
      },
    },
  ],
  variants: {
    Round: {
      price: 199,
      imagePath: "products/lithophane-photo-keychain/36.png",
    },
    Square: {
      price: 199,
      imagePath: "products/lithophane-photo-keychain/32.png",
    },
    Hexagon: {
      price: 199,
      imagePath: "products/lithophane-photo-keychain/31.png",
    },
  },
  images: [
    {
      imagePath: "products/lithophane-photo-keychain/36.png",
    },
    {
      imagePath: "products/lithophane-photo-keychain/32.png",
    },
    {
      imagePath: "products/lithophane-photo-keychain/31.png",
    },
  ],
};

module.exports = product;
