<template>
  <v-card>
    <v-card-title>Upload attachment</v-card-title>
    <v-card-text>
      <v-file-input ref="file" v-model="file2"></v-file-input>
      <img id="demoimg" alt="demo" height="200"/>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" outlined @click="upload">Upload</v-btn>
      <v-btn color="primary" text>cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import firebase from 'firebase'

export default {
  props: [
    'path'
  ],
  data: () => ({
    // file: null,
    file2: null
  }),
  methods: {
    upload () {
      // this.file = this.$refs.file
      // console.log(this.file)
      // console.log(this.file2)

      var preview = document.querySelector('#demoimg')
      var reader = new FileReader()

      reader.addEventListener('load', function () {
        preview.src = reader.result
      }, false)

      if (this.file2) {
        reader.readAsDataURL(this.file2)
      }

      // Create a root reference
      const storageRef = firebase.storage().ref()
      // Create site reference
      // console.log('f', this.path)
      const fileRef = storageRef.child(this.path)
      fileRef.put(this.file2).then((snapshot) => {
        this.$emit('uploaded', true)
      })
    }
  }
}
</script>
