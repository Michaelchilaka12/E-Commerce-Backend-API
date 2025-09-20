
class APIFeatures{
    constructor(query, queryString){
    this.query = query
    this.queryString = queryString

}

filter() {
  const queryObj = { ...this.queryString };

  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Convert price[gte] → { price: { gte: value } }
  const newQueryObj = {};
  Object.keys(queryObj).forEach(key => {
    if (key.includes('[')) {
      const [field, op] = key.split(/\[|\]/).filter(Boolean);
      if (!newQueryObj[field]) newQueryObj[field] = {};
      newQueryObj[field][`$${op}`] = isNaN(queryObj[key]) ? queryObj[key] : Number(queryObj[key]);
    } else {
      newQueryObj[key] = isNaN(queryObj[key]) ? queryObj[key] : Number(queryObj[key]);
    }
  });

  this.query = this.query.find(newQueryObj);
  return this;
}

sort(){
     if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy)
        }else{
           this.query = this.query.sort('-createdAt')
        }

        return this;
}

limitFields(){
     if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields)
        }else{
            this.query = this.query.select('-__v')
        }
        return this;
}

paginate(){
    const page = this.queryString.page *1 ||1;
        const limit = this.queryString.limit * 1 ||100
        const skip = (page - 1) * limit;
        this.query= this.query.skip(skip).limit(limit)

        
    return this;
}
}

module.exports = APIFeatures;