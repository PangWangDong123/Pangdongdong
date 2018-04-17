Page({
    onTap: function (event) {
        // wx.redirectTo({
        //     url: "../posts/post"
        // });

        wx.switchTab({
            url: "../posts/post"
        });
        
        // wx.navigateTo({
        //   url: '../posts/post',
        // })
    }
})