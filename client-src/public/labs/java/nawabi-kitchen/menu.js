/* Nawabi Kitchen - the menu, and the stages an order passes through.
 *
 * Plain data in a plain script. Edit the prices, dishes or stage names here
 * and the rest of the app follows. */
'use strict';

window.Kitchen = (() => {

  /** Each stage lasts this long before the order moves to the next one. */
  const STAGE_MS = 10000;

  /**
   * The life of an order. The first is where it begins, the last is where it
   * ends and stays. Every order walks this list on its own clock, which is why
   * two orders placed a minute apart are never on the same step.
   */
  const STAGES = [
    { name: 'On the Queue',     icon: '\u{1F9FE}', note: 'The kitchen has your order' },
    { name: 'Preparing',        icon: '\u{1F373}', note: 'The cooks have started' },
    { name: 'Finishing',        icon: '\u{1F33F}', note: 'Garnish and the final touches' },
    { name: 'Packing',          icon: '\u{1F961}', note: 'Being packed, still hot' },
    { name: 'Out for delivery', icon: '\u{1F6F5}', note: 'On its way to you' },
    { name: 'Delivered',        icon: '\u{2705}',  note: 'Enjoy your meal' }
  ];

  const MENU = [
    {
      category: 'Biryani & Pulao',
      note: 'Sealed and slow-cooked on dum',
      items: [
        { name: 'Mutton Dum Biryani', price: 380, desc: 'Long-grain rice, slow-cooked mutton, saffron', veg: false },
        { name: 'Murgh Dum Biryani',  price: 320, desc: 'Chicken on the bone, browned onions, kewra', veg: false },
        { name: 'Subz Biryani',       price: 260, desc: 'Seasonal vegetables, mint, fried onion', veg: true },
        { name: 'Yakhni Pulao',       price: 240, desc: 'Rice cooked in a clear spiced stock', veg: false }
      ]
    },
    {
      category: 'Kebabs',
      note: 'From the coal grill',
      items: [
        { name: 'Galouti Kebab',  price: 290, desc: 'Minced mutton, melts on the tongue', veg: false },
        { name: 'Seekh Kebab',    price: 270, desc: 'Skewered mince, charred at the edges', veg: false },
        { name: 'Kakori Kebab',   price: 310, desc: 'The soft one, wrapped around the skewer', veg: false },
        { name: 'Dahi ke Kebab',  price: 230, desc: 'Hung curd and cashew, crisp outside', veg: true }
      ]
    },
    {
      category: 'Curries',
      note: 'Cooked down since morning',
      items: [
        { name: 'Murgh Korma',    price: 300, desc: 'Chicken in an almond and curd gravy', veg: false },
        { name: 'Nihari',         price: 340, desc: 'Overnight mutton shank, ginger on top', veg: false },
        { name: 'Paneer Pasanda', price: 280, desc: 'Stuffed paneer in a rich gravy', veg: true },
        { name: 'Dal Nawabi',     price: 210, desc: 'Black lentils, butter, a long simmer', veg: true }
      ]
    },
    {
      category: 'Breads & Sweets',
      note: 'From the tandoor and the halwai',
      items: [
        { name: 'Sheermal',       price: 70,  desc: 'Saffron flatbread, faintly sweet', veg: true },
        { name: 'Ulta Tawa Paratha', price: 60, desc: 'Layered, cooked on an inverted griddle', veg: true },
        { name: 'Shahi Tukda',    price: 150, desc: 'Fried bread, thickened milk, pistachio', veg: true },
        { name: 'Phirni',         price: 130, desc: 'Ground rice pudding, served chilled', veg: true }
      ]
    }
  ];

  return { STAGE_MS, STAGES, MENU };
})();
