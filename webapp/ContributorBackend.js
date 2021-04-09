const fsprom = require('fs/promises')
const { join } = require('path')

/**
 * @typedef FilterOptions Get filter
 * @type {object}
 * 
 * @property {string} edition Edition name
 * @property {?string} resolution (Optional) can be 32x ou 64x
 * @property {?string} path (Optional) Texture path to match
 */

/**
 * @typedef Contributor Contributor profile
 * @type {object}
 * 
 * @property {string} username Discord username
 * @property {string} type Contributor type
 * @property {string} id Discord ID
 * @property {string} uuid Minecraft player UUID
 */

const ROOT_JSON = join(__dirname, '..', 'json')
const ROOT_CONTRIB = join(ROOT_JSON, 'contributors')
const PROFILE_JSON = join(ROOT_JSON, 'profiles.json')

/**
 * Find string in values
 * @param {string} str String to find in values
 */
Object.prototype.findstr = function(str) {
  return Object.values(this).filter(item => String(item).includes(str))
}

module.exports = {
  /**
   * 
   * @param {FilterOptions} options Filter Options to get our contributor file
   */
  get: function (options) {
    return new Promise((resolve, reject) => {
      fsprom.readFile(join(ROOT_CONTRIB, options.edition + '.json'))
      .then((val) => {
        const contributions = JSON.parse(val)
        let res = []

        if(!options.path) {
          res = contributions
        } else {
          contributions.forEach(contrib => {
            if(contrib.version.findstr(options.path).length) {
              res.push(contrib)
            }
          })
        }

        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
    })
  },

  contributors : {
    /**
     * 
     * @param {String} name contributor Name
     * @param {?String} type Contributor type
     * @returns {Promise}
     */
    get:  function (name, type) {
      return new Promise((resolve, reject) => {
        fsprom.readFile(PROFILE_JSON)
        .then((val) => {
          const contributors = JSON.parse(val)
          const res = []
  
          contributors.forEach(contrib => {
            if((!name || contrib.username.toLowerCase().includes(name.toLowerCase())) && (!type || type == contrib.type)) {
              res.push(contrib)
            }
          })
  
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
      })
    },

    types: function() {
      return new Promise((resolve, reject) => {
        fsprom.readFile(PROFILE_JSON)
        .then((val) => {
          const res = {}
          JSON.parse(val).map(contrib => contrib.type || '').forEach(el => res[el] = '')
          resolve(Object.keys(res))
        })
        .catch((err) => {
          reject(err)
        })
      })
    },

    /**
     * 
     * @param {Contributor} newContrib Contributor object
     * @returns {Promise}
     */
    change: function(newContrib) {
      console.log(newContrib);
      
      return new Promise((resolve, reject) => {
        fsprom.readFile(PROFILE_JSON)
        .then((val) => {
          /**
           * @type {Array<Contributor>}
           */
          const contributors = JSON.parse(val)

          // try to find it
          let contributorIndex = -1
          let i = 0
          while(i < contributors.length && contributorIndex == -1) {
            if(contributors[i].username.toLowerCase() === newContrib.username.toLowerCase()) {
              contributorIndex = i
            }
  
            ++i
          }

          Object.keys(newContrib).forEach(key => {
            if(!['username', 'type', 'uuid', 'id'].includes(key))
              delete newContrib[key]
            })
  
          // push it if not found
          if(contributorIndex == -1)
            contributors.push(newContrib)
          else // else change it
          Object.keys(newContrib).forEach(key => {
            contributors[contributorIndex][key] = newContrib[key]
          })
            
  
          fsprom.writeFile(PROFILE_JSON, JSON.stringify(contributors, null, 2))
          .then(() => resolve())
          .catch(err => reject(err))
        })
        .catch(err => {
          reject(err)
        })
      })
    },

    /**
     * 
     * @param {String} username user to remove
     */
    remove: function(username) {
      return new Promise((resolve, reject) => {
        fsprom.readFile(PROFILE_JSON)
        .then((val) => {
          /**
           * @type {Array<Contributor>}
           */
          const contributors = JSON.parse(val)

          // try to find it
          let contributorIndex = -1
          let i = 0
          while(i < contributors.length && contributorIndex == -1) {
            if(contributors[i].username.toLowerCase() === username.toLowerCase()) {
              contributorIndex = i
            }
  
            ++i
          }
  
          // push it if not found
          if(contributorIndex == -1)
            reject(new Error('Not found'))
          else // else rmeove it
            contributors.splice(contributorIndex, 1)
  
          fsprom.writeFile(PROFILE_JSON, JSON.stringify(contributors, null, 2))
          .then(() => resolve())
          .catch(err => reject(err))
        })
        .catch(err => {
          reject(err)
        })
      })
    }
  }
}