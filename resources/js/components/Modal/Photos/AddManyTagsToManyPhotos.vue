<template>
    <div>
        <add-tags :id="0" class="mb1" />

        <!-- These are the tags the user has added -->
        <Tags class="mb1" :photo-id="0" />

        <button
            :class="button"
            @click="submit"
            :disabled="!hasAddedTags"
        >{{ $t('common.submit') }}</button>
    </div>
</template>

<script>
import AddTags from '../../Litter/AddTags';
import Tags from '../../Litter/Tags';

export default {
    name: 'AddManyTagsToManyPhotos',
    components: {
        AddTags,
        Tags
    },
    data () {
        return {
            processing: false,
            btn: 'button is-medium is-primary'
        };
    },
    computed: {

        /**
         * Add spinner when processing
         */
        button ()
        {
            return this.processing ? this.btn + ' is-loading' : this.btn;
        },

        /**
         * Disable button if false
         */
        hasAddedTags ()
        {
            if (this.processing) return false;

            let tags = this.$store.state.litter.tags;
            let customTags = this.$store.state.litter.customTags;
            let hasTags = tags && tags[0] && Object.keys(tags[0]).length;
            let hasCustomTags = customTags && customTags[0] && customTags[0].length;

            return hasTags || hasCustomTags;
        },
    },
    methods: {

        /**
         * Dispatch request
         */
        async submit ()
        {
            this.processing = true;

            await this.$store.dispatch('ADD_MANY_TAGS_TO_MANY_PHOTOS');

            this.processing = false;
        }
    }
};
</script>

<style scoped>

</style>
