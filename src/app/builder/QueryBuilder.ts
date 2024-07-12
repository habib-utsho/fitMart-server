import { FilterQuery, PopulateOptions, Query } from 'mongoose'

class QueryBuilder<T> {
  public queryModel: Query<T[], T>
  public query: Record<string, unknown>

  constructor(queryModel: Query<T[], T>, query: Record<string, unknown>) {
    this.queryModel = queryModel
    this.query = query
  }

  //   Searching method
  public searchQuery(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm as string
    if (searchTerm) {
      this.queryModel = this.queryModel.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      })
    }
    return this
  }

  //   Filter method
  public filterQuery(findAllFields?: string[]) {
    const queryObj = { ...this.query }
    const excludedFields = ['searchTerm', 'page', 'sort', 'limit', 'fields']
    excludedFields.forEach((el) => delete queryObj[el])

    // Loop through findAllFields and convert arrays to MongoDB $in queries
    if (findAllFields) {
      findAllFields.forEach((field) => {
        const fieldValue = queryObj[field]
        if (typeof fieldValue === 'string' && fieldValue.includes(',')) {
          queryObj[field] = { $in: fieldValue.split(',') }
        }
      })
    }

    this.queryModel = this.queryModel.find(queryObj as FilterQuery<T>)

    return this
  }

  //   Sort method
  public sortQuery() {
    const sort =
      (this.query?.sort as string)?.split(',')?.join(' ') || '-createdAt'

    this.queryModel = this.queryModel.sort(sort)
    return this
  }

  // Paginate method

  public paginateQuery() {
    const page = this.query?.page ? Number(this.query?.page) : 1
    const limit = Number(this.query?.limit) || 10
    const skip = (page - 1) * limit
    this.queryModel = this.queryModel.limit(limit).skip(skip)
    return this
  }

  // Field filtering
  public fieldFilteringQuery() {
    const fields =
      (this.query?.fields as string)?.split(',')?.join(' ') || '-__v'
    this.queryModel = this.queryModel.select(fields)

    return this
  }

  // Populate query
  public populateQuery(populateOptions: (string | PopulateOptions)[]) {
    this.queryModel = this.queryModel.populate(populateOptions)
    return this
  }
}

export default QueryBuilder
