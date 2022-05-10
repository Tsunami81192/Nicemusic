<template>
  <div class="list">
    <div
      class="item"
      v-for="(item, index) of songList"
      :key="item.id"
      :class="
        index == currentIndex && currentSong.id == item.id && playing
          ? 'playing'
          : ''
      "
    >
      <div class="wrapper flex-center">
        <div class="index-container flex-center">
          <div class="avatar">
            <img
              class="avatar-img"
              :src="item.image + '?param=150y150'"
              alt=""
            />
          </div>
          <div class="play-icon">
            <div class="line" style="animation-delay: -1.2s;"></div>
            <div class="line"></div>
            <div class="line" style="animation-delay: -1.5s;"></div>
            <div class="line" style="animation-delay: -0.9s;"></div>
            <div class="line" style="animation-delay: -0.6s;"></div>
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
        <div class="info">
          <p class="name ellipsis">{{ item.name }}</p>
          <p class="author flex-row ellipsis">
            <span class="ellipsis">{{ item.singer }}</span>
          </p>
        </div>
        <p class="duration transition">
          {{ utils.formatSecondTime(item.duration) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
// 歌单列表组件
export default {
  data() {
    return {}
  },
  props: {
    songList: {
      type: Array
    }
  },
  components: {},
  computed: {
    ...mapGetters(['currentIndex', 'playing', 'currentSong'])
  },
  watch: {},
  methods: {
    // 播放歌曲
    playSong(item, index) {
      this.selectPlay({
        list: this.songList,
        index
      })
    },
    // 停止播放歌曲
    pauseSong() {
      this.pausePlay()
    },
    ...mapActions([
      // 点击选择播放
      'selectPlay',
      // 点击播放全部
      'playAll',
      'pausePlay'
    ])
  },
  created() {},
  mounted() {}
}
</script>
<style lang="stylus" scoped>
.list {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
  .item {
    flex: 0 0 50%;
    max-width: 50%;
    margin-bottom: 20px;
    height: 80px;
    padding: 0 15px 30px;
    .wrapper {
      width: 100%;
      height: 70px;
      justify-content: start;
      padding-right: 2%;
      border-radius: 5px;
      position: relative;
      .index-container {
        width: 70px;
        margin-right: 20px;
        position: relative;
        .avatar {
          width: 70px;
          height: 70px;
          position: absolute;
          border-radius: 4px;
          img {
            width: 100%;
            height: 100%;
            border-radius: 4px;
          }
          &::after {
            content: "";
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            background: rgba(0,0,0,0);
            -webkit-transition: all 0.15s;
            transition: all 0.15s;
            border-radius: 4px;
          }
        }
        .play-icon {
          display: none;
          height: 16px;
          min-width: 18px;
          overflow: hidden;
          position: relative;
          z-index: 1;
          .line {
            width: 2px;
            height: 100%;
            margin-left: 2px;
            background-color: #ff410f;
            animation: play .9s linear infinite alternate;
          }
        }
        .play-btn {
          color: $color-theme;
          font-size: 28px;
          display: none;
          text-align: left;
          cursor: pointer;
          position: relative;
        }
        .pause-btn {
          color: $color-theme;
          font-size: 30px;
          display: none;
          text-align: left;
          cursor: pointer;
          position: relative;
        }
      }
      .info {
        flex: 1;
        .name {
          font-size: 14px;
          color: #333333;
          font-weight: bold;
          max-width: 350px;
          margin-bottom: 10px;
        }
        .author {
          font-size: 12px;
          color: #666666;
          font-weight: bold;
          &:after{
            content:'/';
            margin:0 3px;
          }
          &:last-child {
            &:after{
              content:'';
            }
          }
        }
        span {
          font-weight: 400;
          white-space: break-spaces;
        }
      }
      .duration {
        font-size: 14px;
        color: #333333;
        font-weight: bold;
        margin-left: 80px;
      }
      .tools {
        width: 25%;
        height: 100%;
        padding-left: 4.28%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        opacity: 0;
        position: absolute;
        right: 4%;
        top: 0;
        i {
          font-size: 20px;
          cursor: pointer;
          display: block;
          color: #666666;
        }
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
        .avatar {
          &::after {
            background: rgba(0, 0, 0, 0.5);
          }
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
</style>
