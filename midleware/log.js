const fs = require('fs')
const path = require('path')

module.exports = (req, res, next) => {
    const rawHeader = req.headers
  const protocol = req.protocol
  const status = res.statusCode;
  const ip = req.ip;
  const from = rawHeader.referer
  const request = protocol + "://" + rawHeader.host + req.url;
  const brower = rawHeader['user-agent']

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  // fs.readFile(path.join('logStore', 'log.json'), (err, data) => {
  //   const datas = JSON.parse(data)
    const log = {
      "Time": dateTime,
      'From': from,
      'IP': ip,
      'Request': request,
      'status': status,
      'browse': brower,
    }
  //   datas.push(log)
    fs.appendFile(path.join('logStore', 'log.json'), JSON.stringify(log) + ",", (err) => {
      console.log(err)
    })
  // })

  
  next();
}