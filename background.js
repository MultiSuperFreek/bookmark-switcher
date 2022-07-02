const bookmarksToolbarID = 'toolbar_____';
const bookmarksMenuID = 'menu________';
const bookmarksReplaceTitle = 'BookmarkSwitcher';
const bookmarksTempFolderTitle = 'BookmarkSwitcherTemp';

function initSwitchBookmarks() {
    toggle = !toggle;
    browser.browserAction.setBadgeText({
        text: toggle.toString()
    });
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
                    switchBookmarks(toolbar, replace, 'from new');
                });
            } else {
                switchBookmarks(toolbar, replace[0], 'from existing');
            }
        }
    )
}

function switchBookmarks(toolbar, replace, msg) {
    console.log(toolbar, replace, {msg: msg});

    // Move toolbar to replacement folder
    let promises = [];

    if (toolbar.hasOwnProperty('children')) {
        toolbar.children.forEach(function (child) {
            console.log({from_toolbar: child});
            promises.push(
                browser.bookmarks.move(
                    child.id,
                    {
                        parentId: replace.id,
                        index: child.index,
                    }
                )
            );
        });
    }

    if (replace.hasOwnProperty('children')) {
        replace.children.forEach(function (child) {
            console.log({from_replace: child});
            promises.push(
                browser.bookmarks.move(
                    child.id,
                    {
                        parentId: toolbar.id,
                        index: 60,
                    }
                )
            );
        });
    }

    Promise.all(promises).then(function (input) {
        console.log({msg: 'Done', input: input });
    } );
}

let toggle = 1;
browser.browserAction.onClicked.addListener(initSwitchBookmarks);
browser.browserAction.setBadgeText({
    text: toggle.toString()
});