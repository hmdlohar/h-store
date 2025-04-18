const product = {
  name: "Customized Photo Moon Lamp",
  slug: "customized-photo-moon-lamp",
  category: "Lamps",
  description: `
  - Custom Photo Engraving – Upload a picture of your loved ones, and we’ll turn it into a beautiful glowing memory on this 3D moon lamp.
  - Unique Gift Idea – Surprise your partner, friends, or family with a heartfelt and creative gift that stands out.
  - 3D Printed for Realistic Texture – Crafted using advanced 3D printing technology to mimic the surface of the moon, adding a touch of cosmic charm to any room.
  - Soft LED Lighting – Gentle on the eyes, this lamp creates a peaceful and intimate atmosphere without being too bright.
  - Plug & Play Design – Easy to use, simply plug it in and enjoy the personalized glow; no batteries required.
  - Ideal for Any Occasion – A thoughtful and memorable gift for anniversaries, birthdays, weddings, Valentine's Day, or housewarming events.
      
    `,
  mrp: 999,
  price: 699,
  mainImage: {
    imagePath: "products/moon-lamp/MainImage.png",
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
      imagePath: "products/moon-lamp/SideLight.jpg",
    },
    {
      imagePath: "products/moon-lamp/Light%20Off.png",
    },
    {
      imagePath: "products/moon-lamp/frontNoBG.png",
    },
    {
      imagePath: "products/moon-lamp/SideViewMasure.png",
    },
  ],
};

module.exports = product;
