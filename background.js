const bookmarksToolbarID = 'toolbar_____';
const bookmarksMenuID = 'menu________';
const bookmarksReplaceTitle = 'BookmarkSwitcher';

function initSwitchBookmarks() {

    browser.bookmarks.getTree().then(
        function (bookmarksTree) {
            console.log(bookmarksTree);
            const rootNode = bookmarksTree[0];

            let toolbar = rootNode.children.filter((element) => element.id === bookmarksToolbarID);
            let menu = rootNode.children.filter((element) => element.id === bookmarksMenuID);

            toolbar = toolbar[0];
            menu = menu[0];
            console.log(toolbar, menu);

            let replace = menu.children.filter((element) => element.title === bookmarksReplaceTitle);
            if (replace.length === 0) {
                console.log({msg: "Create replacement folder"});

                browser.bookmarks.create({
                    parentId: bookmarksMenuID,
                    title: bookmarksReplaceTitle,
                }).then(function (replace) {
                    switchBookmarks(toolbar, replace, 'from new').then(result => console.log({msg: 'Done', result: result}));
                });
            } else {
                switchBookmarks(toolbar, replace[0], 'from existing').then(result => console.log({msg: 'Done', result: result}));
            }
        }
    )
}

async function switchBookmarks(toolbar, replace, msg) {
    console.log(toolbar, replace, {msg: msg});

    // Move toolbar to replacement folder
    if (toolbar.hasOwnProperty('children')) {
        for (let i = 0; i < toolbar.children.length; i++) {
            let child = toolbar.children[i];
            console.log({from_toolbar: child});
            await browser.bookmarks.move(
                child.id,
                {
                    parentId: replace.id,
                    index: child.index,
                }
            ).then(result => result);
        }
    }

    if (replace.hasOwnProperty('children')) {
        for (let i = 0; i < replace.children.length; i++) {
            let child = replace.children[i];
            console.log({from_replace: child});
            await browser.bookmarks.move(
                child.id,
                {
                    parentId: toolbar.id,
                    index: child.index,
                }
            ).then(result => result);
        }
    }

    console.log({msg: 'End'});
}

browser.browserAction.onClicked.addListener(initSwitchBookmarks);