/**
 * Created by 金宝塔四楼扛把子 on 2017/4/10.
 */
function a() {
    console.log(1)
    b()
}
function b() {
    console.log(2)
}

a(b)
console.log(3)
//回调函数：满足一定的条件
//promise
//setinterval
//