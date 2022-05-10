<template>
  <transition name="slide-fade">
    <div class="player-bar flex-row" v-show="playList.length > 0">
      <div class="container" style="z-index: 30">
        <div class="wrapper flex-row">
          <div class="left flex-row">
            <div class="player-btn">
              <i class="iconfont icon-prev nice1_music83" @click="prevSong"></i>
              <div class="icon-play flex-center" @click="togglePlaying">
                <i class="iconfont" :class="playIcon"></i>
              </div>
              <i class="iconfont icon-next nice1_music82" @click="nextSong"></i>
            </div>
          </div>
          <div class="center">
            <img
              class="cover"
              :src="currentSong.image ? currentSong.image : defaultCover"
              alt="nicemusic"
            />
            <div class="info">
              {{ currentLyricTxt }}
              <div class="top flex-between">
                <h2 class="name">
                  {{ currentSong.name ? currentSong.name : '未选择歌曲'
                  }}<span>{{ currentSong.singer }}</span>
                </h2>
                <p class="time" v-if="currentSong.duration">
                  {{ formatTime(currentTime) }} /
                  {{ formatTime(currentSong.duration) }}
                </p>
                <p class="time" v-else>00:00 / 00:00</p>
              </div>
              <div class="progress-wrap flex-row">
                <a-slider
                  v-model="percent"
                  :disabled="currentIndex === -1"
                  @change="changeProgress"
                  @afterChange="changeProgressAfter"
                  :tip-formatter="progressFormatter"
                />
              </div>
            </div>
          </div>
          <div class="right flex-row">
            <div class="volume-wrap flex-row">
              <i
                class="iconfont volume-icon"
                @click="changeMuted"
                :class="mutedIcon"
              ></i>
              <a-slider v-model="volumeNum" @change="changeVolume"></a-slider>
            </div>
            <div class="tool">
              <i class="iconfont" :class="modeIcon" @click="changeMode"></i>
              <i class="iconfont nicegeci32" @click="openLyric"></i>
              <i class="iconfont nicebofangliebiao24" @click="openPlaylist"></i>
            </div>
          </div>
          <audio
            ref="audio"
            :src="currentSong.url"
            @playing="audioReady"
            @error="audioError"
            @timeupdate="updateTime"
            @ended="audioEnd"
            @pause="audioPaused"
            :muted="isMuted"
          ></audio>
          <transition name="slide-fade">
            <div class="playlist-box shadow" v-if="showPlaylist">
              <div class="title flex-between">
                播放列表<i
                  class="iconfont nicelajitong"
                  alt="清空"
                  title="清空"
                  @click="clearHistory"
                ></i>
              </div>
              <div class="list">
                <div
                  class="item flex-row"
                  v-for="(item, index) of historyList"
                  :key="item.id"
                  :class="currentSong.id == item.id && playing ? 'playing' : ''"
                >
                  <div class="index-container flex-center">
                    <span class="num">{{
                      utils.formatZero(index + 1, 2)
                    }}</span>
                    <div class="play-icon">
                      <div class="line" style="animation-delay: -1.2s"></div>
                      <div class="line"></div>
                      <div class="line" style="animation-delay: -1.5s"></div>
                      <div class="line" style="animation-delay: -0.9s"></div>
                      <div class="line" style="animation-delay: -0.6s"></div>
                    </div>
                    <i
                      class="iconfont nicebofang2 play-btn"
                      @click="playSong(item, index)"
                    ></i>
                    <i
                      class="iconfont nicezanting1 pause-btn"
                      @click="pauseSong(item, index)"
                    ></i>
                  </div>
                  <p class="ellipsis">{{ item.name }}</p>
                  <i
                    class="iconfont niceIcon_cloose"
                    @click="deleteHistoryItem(item, index)"
                  ></i>
                </div>
              </div>
              <div class="foot"></div>
            </div>
          </transition>
        </div>
      </div>
      <transition name="slide-fade">
        <div class="player-page" v-show="showLyric">
          <div class="container">
            <div class="page-left">
              <div class="cover-image" :class="playing ? 'playing' : ''">
                <img :src="currentSong.image" />
              </div>
            </div>
            <div class="page-right">
              <h3 class="name flex-between">
                {{ currentSong.name }}
                <i
                  @click="openLyric"
                  class="iconfont niceiconfontyoujiantou-copy-copy-copy-copy"
                ></i>
              </h3>
              <p>{{ currentSong.singer }} - {{ currentSong.album }}</p>
              <div class="lyric-wrap">
                <n-lyric
                  ref="lyricRef"
                  :currentLyric="currentLyric"
                  :currentLyricNum="currentLyricNum"
                ></n-lyric>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import Vue from 'vue'
import 'ant-design-vue/dist/antd.css'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from '@/common/playConfig'
import Lyric from 'lyric-parser'
import { Slider } from 'ant-design-vue'
import NLyric from 'components/common/lyric/Index'
Vue.use(Slider)
export default {
  data() {
    return {
      songReady: false,
      currentTime: 0,
      currentLyric: null,
      currentLyricNum: 0,
      currentLyricTxt: '',
      showLyric: false,
      showPlaylist: false,
      id: '',
      playingLyric: '',
      isPureMusic: false,
      pureMusicLyric: '',
      isMuted: false,
      volume: 0.5,
      volumeNum: 50,
      percent: 0,
      defaultCover: require('../../../assets/images/cd.png'),
      progressState: false
    }
  },
  components: {
    NLyric
  },
  computed: {
    // 播放暂停按钮
    playIcon() {
      return this.playing ? 'nice07zanting' : 'niceicon_play'
    },
    // 播放模式
    modeIcon() {
      return this.mode === playMode.sequence
        ? 'nicexunhuanbofang24'
        : this.mode === playMode.loop
        ? 'nicebofangqidanquxunhuan'
        : 'nicebofangqisuijibofang'
    },
    // 是否静音
    mutedIcon() {
      return this.isMuted ? 'nicejingyin1' : 'niceshengyin1'
    },
    // 进度条
    ...mapGetters([
      'playList',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      'sequenceList',
      'historyList'
    ])
  },
  watch: {
    // 监听歌曲内容变化
    currentSong(newSong, oldSong) {
      if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
        return
      }
      this.songReady = false
      this.canLyricPlay = false
      if (this.currentLyric) {
        this.currentLyric.stop()
        // 重置为null
        this.currentLyric = null
        this.currentTime = 0
        this.playingLyric = ''
        this.currentLyricNum = 0
      }
      this.$nextTick(() => {
        const audio = this.$refs.audio
        if (audio) {
          audio.src = newSong.url
          audio.volume = this.volume
          audio.play()
          this.saveHistoryList(newSong)
          this.id = newSong.id
        }
      })
      // 若歌曲 5s 未播放，则认为超时，修改状态确保可以切换歌曲。
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.songReady = true
      }, 5000)
      this.getLyric(newSong.id)
    },
    // 监听播放状态
    playing(isPlaying) {
      if (!this.songReady) {
        return
      }
      this.$nextTick(() => {
        const audio = this.$refs.audio
        if (audio) {
          isPlaying ? audio.play() : audio.pause()
        }
      })
    }
  },
  methods: {
    // 清空历史播放列表
    clearHistory() {
      this.clearHistoryList()
    },
    // 移除最近播放单曲
    deleteHistoryItem(item, index) {
      console.log(item, index)
      this.deleteHistoryList(item)
    },
    // 播放歌曲
    playSong(item, index) {
      this.selectPlay({
        list: this.historyList,
        index
      })
    },
    // 停止播放歌曲
    pauseSong() {
      this.pausePlay()
    },
    // 展开播放列表
    openPlaylist() {
      if (this.showPlaylist) {
        this.showPlaylist = false
      } else {
        this.showPlaylist = true
      }
    },
    // 控制音量大小
    changeMuted() {
      this.isMuted ? this.mutedHandle(false, 50) : this.mutedHandle(true, 0)
    },
    // 控制是否静音
    mutedHandle(state, num) {
      console.log(num)
      this.isMuted = state
      this.volumeNum = num
      this.$refs.audio.volume = num / 100
    },
    // 改变音量
    changeVolume(e) {
      e === 0 ? (this.isMuted = true) : (this.isMuted = false)
      this.volume = e / 100
      this.$refs.audio.volume = e / 100
    },
    // 展开歌词
    openLyric() {
      if (this.showLyric) {
        this.showLyric = false
      } else {
        this.showLyric = true
      }
    },
    closeLyric() {
      this.showLyric = false
    },
    // 获取歌词
    async getLyric(id) {
      try {
        let res = await this.$api.getLyric(id)
        console.log(res)
        if (res.code === 200) {
          let lyric = res.lrc.lyric
          this.currentLyric = new Lyric(lyric, this.lyricHandle)
          if (this.isPureMusic) {
            this.playingLyric = this.currentLyric.lrc.replace(
              /\[(\d{2}):(\d{2}):(\d{2})\]/g,
              ''
            )
          } else {
            if (this.playing && this.canLyricPlay) {
              this.currentLyric.seek(this.currentTime * 1000)
            }
          }
        }
      } catch (error) {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLyricNum = 0
      }
    },
    // 歌词回调
    lyricHandle({ lineNum, txt }) {
      if (!this.$refs.lyricRef.$refs.lyricLine) {
        return
      }
      this.currentLyricNum = lineNum
      this.playingLyric = txt
      if (lineNum > 10) {
        let lineEl = this.$refs.lyricRef.$refs.lyricLine[lineNum - 10]
        if (this.$refs.lyricRef.$refs.lyricList) {
          this.$nextTick(() => {
            this.$refs.lyricRef.$refs.lyricList.scrollToElement(lineEl, 1000)
          })
        }
      } else {
        if (this.$refs.lyricRef.$refs.lyricList) {
          this.$nextTick(() => {
            this.$refs.lyricRef.$refs.lyricList.scrollTo(0, 0, 1000)
          })
        }
      }
    },
    // 点击播放暂停
    togglePlaying() {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    // 上一首
    prevSong() {
      if (!this.songReady) {
        return
      }
      if (this.playList.length === 1) {
        this.loopSong()
        return
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playList.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
    },
    // 下一首
    nextSong() {
      if (!this.songReady) {
        return
      }
      if (this.playList.length === 1) {
        this.loopSong()
        return
      } else {
        let index = this.currentIndex + 1
        if (index === this.playList.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
    },
    // 单曲循环播放
    loopSong() {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      this.setPlayingState(true)
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    // 播放准备完成
    audioReady() {
      clearTimeout(this.timer)
      this.songReady = true
      this.canLyricPlay = true
      if (this.currentLyric && !this.isPureMusic) {
        this.currentLyric.seek(this.currentTime * 1000)
      }
    },
    // 歌曲错误
    audioError() {
      clearTimeout(this.timer)
      this.songReady = true
    },
    // 歌曲暂停
    audioPaused() {
      this.setPlayingState(false)
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
    },
    // 歌曲播放完成
    audioEnd() {
      this.currentTime = 0
      if (this.mode === playMode.loop) {
        this.loopSong()
      } else {
        this.nextSong()
      }
    },
    // 监听播放时间改变
    updateTime(e) {
      // console.log(e)
      if (!this.progressState) {
        this.currentTime = e.target.currentTime
        this.percent = (e.target.currentTime / this.currentSong.duration) * 100
      }
    },
    // 进度条悬浮时间
    progressFormatter() {
      return this.formatTime(this.currentTime)
    },
    // 改变进度
    changeProgress(val) {
      this.progressState = true
      const currentTime = (val / 100) * this.currentSong.duration
      this.currentTime = currentTime
      this.percent = val
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    // 拖动结束
    changeProgressAfter(val) {
      const currentTime = ((val / 100) * this.currentSong.duration) / 1000
      this.$refs.audio.currentTime = currentTime * 1000
      this.currentTime = currentTime * 1000
      this.progressState = false
      if (!this.playing) {
        this.togglePlaying()
      }
    },
    // 切换播放模式
    changeMode() {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = this.utils.shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    // 重置当前播放歌曲序号
    resetCurrentIndex(list) {
      let index = list.findIndex(item => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    // 格式化时间
    formatTime(interval) {
      interval = interval | 0
      const m = (interval / 60) | 0
      const s = interval % 60
      return `${this.utils.formatZero(m, 2)}:${this.utils.formatZero(s, 2)}`
    },
    // 播放页
    toPlayer(song) {
      console.log(song)
      this.$router.push({
        name: 'player',
        query: {
          id: song.id
        }
      })
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'saveHistoryList',
      'deleteHistoryList',
      'clearHistoryList',
      'selectPlay',
      'pausePlay'
    ])
  },
  created() {},
  mounted() {
    console.log(this.historyList)
  }
}
</script>
<style lang="stylus" scoped>
.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.5, 0.3, 0.2, 0.5);
}

.slide-fade-enter, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.player-bar {
  width: 100%;
  height: 72px;
  background: rgba(255, 255, 255, 0.95);
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 1001;
  padding: 0 10px 0 20px;
  -webkit-box-pack: justify;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  padding-left: calc(100vw - 100%);

  .player-page {
    width: 100%;
    height: 100vh;
    background: rgba(255, 255, 255, 1);
    position: fixed;
    top: 0px;
    left: 0;
    padding-top: 100px;

    .container {
      display: flex;

      .page-left, .page-right {
        width: 50%;
      }

      .cover-image {
        width: 400px;
        height: 400px;
        position: relative;

        img {
          width: 100%;
          height: 100%;
          border-radius: 5px;
          position: relative;
          z-index: 2;
          opacity: 1;
          overflow: hidden;
          border-radius: 5px;
          box-shadow: 5px 0 10px -5px #141414;
        }

        &::after {
          content: '';
          position: absolute;
          left: 20%;
          top: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          transition: all cubic-bezier(0.4, 0, 0.2, 1) 0.8s 0.5s;
          background: transparent url('../../../assets/images/cd-wrap.png') center no-repeat;
          background-size: contain;
        }

        &.playing {
          &::after {
            -webkit-animation: rotate 2s linear infinite;
            -moz-animation: rotate 2s linear infinite;
            -ms-animation: rotate 2s linear infinite;
            -o-animation: rotate 2s linear infinite;
            animation: rotate 2s linear infinite;
          }
        }
      }

      .page-right {
        .name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;

          .iconfont {
            font-size: 35px;
            color: #888;
            cursor: pointer;
            transform: rotate(90deg);
          }
        }

        .lyric-wrap {
          width: 100%;
          height: 480px;
          border-radius: 4px;
          padding: 30px;
          overflow: hidden;
          background: #f8f9ff;
          margin-top: 30px;
        }
      }
    }
  }

  .left {
    margin-right: 20px;

    .player-btn {
      height: 40px;
      display: flex;
      align-items: center;

      i {
        cursor: pointer;

        &:active {
          opacity: 0.8;
        }
      }

      .icon-prev, .icon-next {
        font-size: 20px;
        color: #fa2800;
      }

      .icon-play {
        width: 43px;
        height: 43px;
        background: linear-gradient(110deg, #fa2800, #fb8974);
        border-radius: 50%;
        margin: 0 26px;

        i {
          font-size: 22px;
          color: #ffffff;
        }
      }
    }
  }

  .center {
    height: 72px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;

    .cover {
      width: 50px;
      height: 50px;
      margin-right: 10px;
      border-radius: 4px;
      cursor: pointer;
    }

    .info {
      width: 100%;
      margin: 0 20px 0 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 72px;

      .name {
        font-size: 13px;
        font-weight: bold;
        margin-right: 10px;

        span {
          font-size: 12px;
          color: #888888;
          font-weight: 200;
          margin-left: 10px;
        }
      }
    }

    .progress-wrap {
      width: 100%;

      span {
        font-size: 14px;
      }

      .ant-slider {
        margin: 15px 5px 0 5px;
      }
    }
  }

  .right {
    height: 72px;

    .volume-icon {
      font-size: 23px;
      font-weight: 700;
      cursor: pointer;
      margin-right: 10px;
    }

    .volume-wrap {
      width: 150px;
      margin-right: 10px;

      .ant-slider {
        margin-top: 9px;
      }
    }

    .tool {
      i {
        font-size: 26px;
        margin: 0 10px;
        cursor: pointer;
      }
    }
  }

  .playlist-box {
    width: 345px;
    height: 550px;
    position: absolute;
    right: 5px;
    bottom: 30px;
    border-radius: 3px;
    padding: 30px;
    overflow: hidden;

    .title {
      margin: 10px 0 20px;
      font-weight: 500;
      font-size: 16px;

      i {
        font-size: 20px;
        cursor: pointer;

        &:hover {
          color: $color-theme;
        }
      }

      .clearBtn {
        font-size: 16px;
        color: $color-theme;
        cursor: pointer;
      }
    }

    .list {
      overflow-y: scroll;
      max-height: calc(100% - 90px);

      .item {
        padding: 8px 0;
        height: 40px;

        .index-container {
          width: 30px;
          margin-right: 20px;
          flex-shrink: 0;

          .num {
            font-size: 14px;
            color: #4a4a4a;
          }

          .play-icon {
            display: none;
            height: 16px;
            min-width: 18px;
            overflow: hidden;

            .line {
              width: 2px;
              height: 100%;
              margin-left: 2px;
              background-color: #ff410f;
              animation: play 0.9s linear infinite alternate;
            }
          }

          .play-btn {
            color: $color-theme;
            font-size: 28px;
            display: none;
            text-align: left;
            cursor: pointer;
          }

          .pause-btn {
            color: $color-theme;
            font-size: 30px;
            display: none;
            text-align: left;
            cursor: pointer;
          }
        }

        p {
          cursor: pointer;
          flex: 1;
          margin-right: 20px;

          &.active {
            color: $color-theme;
          }
        }

        i {
          font-size: 20px;
          cursor: pointer;

          &:hover {
            color: $color-theme;
          }
        }

        &.playing {
          p {
            color: $color-theme;
          }

          i {
            color: $color-theme;
          }

          .index-container {
            .num {
              display: none;
            }

            .play-icon {
              display: flex;
            }

            .play-btn {
              display: none;
            }
          }
        }

        &:hover {
          .index-container {
            .num {
              display: none;
            }

            .play-btn {
              display: block;
            }
          }

          &.playing {
            .index-container {
              .play-btn {
                display: none;
              }

              .play-icon {
                display: none;
              }

              .pause-btn {
                display: block;
              }
            }
          }
        }
      }
    }
  }
}
</style>
