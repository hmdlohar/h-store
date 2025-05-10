const product = {
  isActive: true,
  name: "Customized Glob Night Lamp",
  slug: "customized-glob-night-lamp",
  category: "Lamps",
  description: `
  - Custom Photo Engraving – Upload a picture of your loved ones, and we’ll turn it into a beautiful glowing memory on this 3D glob night lamp.
  - Unique Gift Idea – Surprise your partner, friends, or family with a heartfelt and creative gift that stands out.
  - 3D Printed for Realistic Texture – Crafted using advanced 3D printing technology to mimic the surface of the glob, adding a touch of cosmic charm to any room.
  - Soft LED Lighting – Gentle on the eyes, this lamp creates a peaceful and intimate atmosphere without being too bright.
  - Plug & Play Design – Easy to use, simply plug it in and enjoy the personalized glow; no batteries required.
  - Ideal for Any Occasion – A thoughtful and memorable gift for anniversaries, birthdays, weddings, Valentine's Day, or housewarming events.
      
    `,
  mrp: 999,
  price: 299,
  mainImage: {
    imagePath: "products/glob-night-lamp/MainImage.png",
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
  images: [
    {
      imagePath: "products/glob-night-lamp/OnOff.png",
    },
    {
      imagePath: "products/glob-night-lamp/SideViewOn.png",
    },
    {
      imagePath: "products/glob-night-lamp/CloseUpView.png",
    },
    {
      imagePath: "products/glob-night-lamp/SideViewMasure.png",
    },
  ],
};

module.exports = product;
