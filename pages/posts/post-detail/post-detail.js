var postsData = require('../../../data/posts-data.js')
var app = getApp()

Page({
    data:{
        isPlayingMusic: false
    },
    onLoad:function(option){
        var globalData = app.globalData;
        var postId = option.id;
        this.data.currentPostId = postId;
        var postData = postsData.postList[postId];
        //如果在onLoad方法中，不是异步的去执行一个数据绑定
        //则不需要使用this.setData方法
        //只需要对this.data赋值即可实现数据绑定
        this.setData({
            postData: postData
        })

        // var postsCollected = {
        //     1: 'true',
        //     2: 'false',
        //     3: 'true'
        //     ...
        // }

        var postsCollected = wx.getStorageSync('posts_collected')
        if(postsCollected){
            var postCollected = postsCollected[postId]
            this.setData({
                collected: postCollected
            })
        }
        else{
            var postsCollected = {};
            postsCollected[postId] = false;
            wx.setStorageSync('posts_collected',postsCollected)
        }
        
        if(app.globalData.g_isPlayingMusic && app.globalData.g_currentMusicPostId === postId ){
            this.setData({
                isPlayingMusic : true
            })
        }
        this.setAudioMontor()
    },

    setAudioMontor: function(){
        var that = this
        wx.onBackgroundAudioPlay(function(){
            that.setData({
                isPlayingMusic : true
            })
            app.globalData.g_isPlayingMusic = true;
            app.globalData.g_currentMusicPostId = that.data.currentPostId;
        });
        wx.onBackgroundAudioPause(function(){
            that.setData({
                isPlayingMusic : false
            })
            app.globalData.g_isPlayingMusic = false;
            app.globalData.g_currentMusicPostId = null;
        })
    },

    onColletionTap:function(event){
        // this.getPostsCollectedSyc();
        this.getPostsCollectedAsy();
        // wx.showToast({
        //     title:postCollected?'收藏成功':'取消成功',
        //     duration: 1000,
        //     icon: 'success'
        // })
    },

    getPostsCollectedAsy: function(){
        var that = this;
        wx.getStorage({
            key: 'posts_collected',
            success:function(res){
                var postsCollected = res.data;
                var postCollected = postsCollected[that.data.currentPostId];
                //收藏变成未收藏，未收藏变成收藏
                postCollected = !postCollected;
                postsCollected[that.data.currentPostId] = postCollected;
                that.showModal(postsCollected,postCollected)
            }
        })
    },

    getPostsCollectedSyc: function(){
        var postsCollected = wx.getStorageSync('posts_collected');
        var postCollected = postsCollected[this.data.currentPostId];
        //收藏变成未收藏，未收藏变成收藏
        postCollected = !postCollected;
        postsCollected[this.data.currentPostId] = postCollected;
        this.showModal(postsCollected,postCollected)
    },

    showModal: function(postsCollected,postCollected){
        var that = this;
        wx.showModal({
            title: '收藏',
            content: postCollected?'是否收藏该文章':'是否取消收藏该文章',
            showCancel:'true',
            cancelText:'取消',
            cancelColor: 'pink',
            confirmText: '确定',
            confirmColor: 'yellow',
            success:function(res){
                if(res.confirm){
                     //更新文章是否的缓存值
                    wx.setStorageSync('posts_collected',postsCollected);
                    // 更新数据绑定变量，从而实现切换图片
                    that.setData({
                        collected: postCollected
                    })
                }
            }
        })
    },          

    showToast: function(){
        //更新文章是否的缓存值
        wx.setStorageSync('posts_collected',postsCollected);
        // 更新数据绑定变量，从而实现切换图片
        this.setData({
            collected: postCollected
        })
        wx.showToast({
            title: postCollected?"收藏成功":'已取消收藏',
            duration: 1000,
            icon: 'success'
        })
    },

    onShareTap:function(event){
        var itemList = [
            '分享给微信好友',
            '分享到朋友圈',
            '分享给QQ好友',
            '分享到微博'
        ]
        wx.showActionSheet({
            itemList: itemList,
            itemColor: '#b3d4db',
            success:function(res){
                // res.cancel 用户是不是点击了取消按钮
                // res.tapIndex 数组元素的序号，从0开始
                wx.showModal({
                    title: '用户' + itemList[res.tapIndex],
                    content: "用户是否取消"+res.cancel+"现在无法实现分享功能，什么时候可以呢"
                })
            }
        })
    },

    onMusicTap: function(event){
        var currentPostId = this.data.currentPostId;
        var postData = postsData.postList[currentPostId];
        var isPlayingMusic = this.data.isPlayingMusic;
        if (isPlayingMusic) {
            wx.pauseBackgroundAudio();
            this.setData({
                isPlayingMusic: false
            })

        }
        else {
            wx.playBackgroundAudio({
                dataUrl: postData.music.url,
                title: postData.music.title,
                coverImgUrl: postData.music.coverImg,
            })
            this.setData({
                isPlayingMusic: true
            })
        }
    }
})