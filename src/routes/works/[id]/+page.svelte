<script lang="ts">
    import type { PageData } from './$types';

    import { goto } from "$app/navigation";

    const { data }: { data: PageData } = $props();
    const workData = data.work;

    const onclickModifyWork = (e: Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        goto(`/works/${workData.id}/edit`)
    }

</script>


<h2>Work - Details</h2>
<div>
    <div class="input-field">
        <label for="title">題名</label>
        <span class="data-value">{workData.title}</span>
    </div>
    <div class="input-field">
        <label for="originalTitle">原題</label>
        <span class="data-value">{workData.originalTitle}</span>
    </div>
    <div class="input-field">
        <label for="contentType">種別</label>
        <span class="data-value">{workData.contentType}</span>
    </div>
    {#each workData.relatedPersons as relatedPerson, i (relatedPerson.orderNo)}
    <div class="input-field">
        {#if i == 0}
        <label for="">著作者</label>
        {:else}
        <label for="">&nbsp</label>
        {/if}
        <span class="data-value">{relatedPerson.personName} {relatedPerson.role.replace("者", "")}</span>
    </div>              
    {/each}
    <div class="input-field">
        <label for="publicationYear">発表年</label>
        <span class="data-value">{workData.publicationYear}</span>
    </div>      
    <div class="input-field">
        <label for="description">解説</label>
        <span class="data-value">{workData.description}</span>
    </div>      
    <div class="input-field">
        <label for="url">URL</label>
        <span class="data-value"><a href="{workData.url}">{workData.url}</a></span>
    </div>      
    <div class="input-field">
        <label for="seqNo">連番</label>
        <span class="data-value">{workData.seqNo}</span>
    </div>      
    <div class="input-field">
        <label for="note">補記</label>
        <span class="data-value">{workData.note}</span>
    </div>      
</div>
<div class="button-container">
    <button onclick={onclickModifyWork}>変更</button>
</div>
<div class="footer">
    <a href="/works">Back to Works</a>
</div>

<style>
    .footer {
        margin-top: 1rem;
    }
</style>