class ProductModel {
  constructor(
    title,
    description,
    price,
    texture,
    wash,
    place,
    note,
    story,
    mainImageUrl,
    subImageUrlList,
    category,
    keyword,
  ) {
    this.title = title;
    this.description = description;
    this.price = price;
    this.texture = texture;
    this.wash = wash;
    this.place = place;
    this.note = note;
    this.story = story;
    this.mainImageUrl = mainImageUrl;
    this.subImageUrlList = subImageUrlList;
    this.category = category;
    this.keyword = keyword;
  }
}

module.exports = {
  ProductModel,
};
