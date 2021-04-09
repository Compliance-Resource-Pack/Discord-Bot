export default {
	name: 'contribution-page',
	template: `
  <v-card width="600" flat color="transparent">
    <v-card-title>
      Add a contributor
    </v-card-title>

    <v-card-text>
      <v-form lazy-validation>
        <v-select required v-model="formData.edition" :items="editions" label="Modpack edition"></v-select>

        <v-select required v-model="formData.resolution" :items="resolutions" label="Modpack edition"></v-select>

        <v-text-field required clearable v-model="formData.texturePath" label="Texture path"></v-text-field>

        <v-radio-group row v-model="formData.addElseRemoveAuthor">
          <v-radio
            v-for="(label, index) in addElseRemoveAuthorLabels"
            :key="label"
            :label="label"
            :value="index == 0"
          ></v-radio>
        </v-radio-group>

        <v-text-field required clearable v-model="formData.discordTag" label="Author discord tag"></v-text-field>

        <v-text-field required clearable type="password" v-model="formData.password" label="Security password" hint="must match .env password"></v-text-field>
        
        <v-checkbox required v-model="formData.pushToGithub" :label="label"></v-checkbox>

        <v-btn color="success" class="mr-4" block @click="send">Validate</v-btn>
      </v-form>
    </v-card-text>
  </v-card>`,
	data() {
		return {
      editions: ['java', 'bedrock'],
      resolutions: ['c32', 'c64'],
      addElseRemoveAuthorLabels: ['Add author', 'Remove author'],
      formData : {
        edition: 'java',
        resolution: 'c32',
  
        texturePath: '/item/bucket',
  
        addElseRemoveAuthor: true,
        discordTag: 'TheRolf#8604',
        
        pushToGithub: false,
  
        password: "TheRolfIsTheBest"
      }
		}
	},
  computed: {
    label: function() {
      return `Push JSON to GitHub : ${ this.formData.pushToGithub ? 'yes' : 'no'}`;
    }
  },
  methods: {
    send() {
      const data = JSON.parse(JSON.stringify(this.formData))
      data.password = makeid(24)
      
      axios.post('http://localhost:3000/contributor', data)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }
}