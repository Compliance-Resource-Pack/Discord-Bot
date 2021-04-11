const fsprom = require('fs/promises')
const { join } = require('path')

const ROOT_JSON = join(__dirname, '..', '..', 'json')
const ROOT_CONTRIB = join(ROOT_JSON, 'contributors')

module.exports = {
  /**
   * 
   * @param {String} edition Game edition to search
   * @param {?String} search search looked
   * @returns {Promise} Result promise
   */
  get: function(edition, search = undefined) {
    return new Promise((resolve, reject) => {
      fsprom.readFile(join(ROOT_CONTRIB, edition + '.json'))
      .then(val => {
        val = JSON.parse(val)
        
        if(search) {
          tmp = []

          val.forEach(contrib => {
            const versionpaths = Object.values(contrib.version)
            let add = false

            // version
            let i = 0
            while(i < versionpaths.length && !add) {
              if(versionpaths[i].includes(search)) {
                add = true
                console.log(contrib)
                tmp.push(contrib)
              }
              ++i
            }

            if(add)
              return

            // author
            const authors = [...Object.values(contrib.c32), ...Object.values(contrib.c64)]

            i = 0
            while(i < authors.length && !add) {
              if(authors[i].includes(search)) {
                add = true
                console.log(contrib)
                tmp.push(contrib)
              }
            }
          })

          console.log(tmp);

          val = tmp
        }

        resolve(val)
      })
      .catch(err => reject(err))
    })
  }
}