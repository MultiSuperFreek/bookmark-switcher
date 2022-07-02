const bookmarksToolbarID = 'toolbar_____';
const bookmarksMenuID = 'menu________';
const bookmarksReplaceTitle = 'BookmarkSwitcher';

function initSwitchBookmarks() {
    if (disabled) {
        return;
    }
    disabled = true;
    browser.bookmarks.getTree().then(
        function (bookmarksTree) {
            // Get the toolbar and the menu with the replacement folder
            const rootNode = bookmarksTree[0];

            let toolbar = rootNode.children.filter((element) => element.id === bookmarksToolbarID);
            let menu = rootNode.children.filter((element) => element.id === bookmarksMenuID);

            toolbar = toolbar[0];
            menu = menu[0];

            // Check if a replacement folder exists, and if not, create it
            let replace = menu.children.filter((element) => element.title === bookmarksReplaceTitle);
            if (replace.length === 0) {
                browser.bookmarks.create({
                    parentId: bookmarksMenuID,
                    title: bookmarksReplaceTitle,
                }).then(function (replace) {
                    switchBookmarks(toolbar, replace).then(function () { disabled = false; });
                });
            } else {
                switchBookmarks(toolbar, replace[0]).then(function () { disabled = false; });
            }
        }
    )
}

// The result from all the promises is irrelevant
async function switchBookmarks(toolbar, replace) {
    // Move toolbar bookmarks to replacement folder
    if (toolbar.hasOwnProperty('children')) {
        for (let i = 0; i < toolbar.children.length; i++) {
            let child = toolbar.children[i];
            await browser.bookmarks.move(
                child.id,
                {
                    parentId: replace.id,
                    index: child.index,
                }
            );
        }
    }

    // Move replacement bookmarks to toolbar folder
    if (replace.hasOwnProperty('children')) {
        for (let i = 0; i < replace.children.length; i++) {
            let child = replace.children[i];
            await browser.bookmarks.move(
                child.id,
                {
                    parentId: toolbar.id,
                    index: child.index,
                }
            );
        }
    }
}

let disabled = false;
browser.browserAction.onClicked.addListener(initSwitchBookmarks);