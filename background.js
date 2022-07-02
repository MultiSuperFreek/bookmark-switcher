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
    browser.bookmarks.create({
        title: bookmarksTempFolderTitle,
    }).then(function (temp) {
        // Move toolbar to temp folder
        let promises = [];
        toolbar.children.forEach(function (child) {
            console.log(child);
            promises.push(
                browser.bookmarks.move(
                    child.id,
                    {
                        parentId: temp.id,
                        index: child.index,
                    }
                )
            );
        });
        Promise.all(promises).then(function () {
            // Move replacement to toolbar
            let promises = [];
            replace.children.forEach(function (child) {
                console.log(child);
                promises.push(
                    browser.bookmarks.move(
                        child.id,
                        {
                            parentId: toolbar.id,
                            index: child.index,
                        }
                    )
                );
            });
            Promise.all(promises).then(function () {
                // Move temp folder to replacement
                let promises = [];
                temp.children.forEach(function (child) {
                    console.log(child);
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
                Promise.all(promises).then(function () {
                    // Cleanup

                } )
            } )
        } )
    });
}

let toggle = 1;
browser.browserAction.onClicked.addListener(initSwitchBookmarks);
browser.browserAction.setBadgeText({
    text: toggle.toString()
});