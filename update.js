/* Kolyma Network, ALL RIGHTS RESERVED
 */

/* Module */
const kkupdate = { name: "KK Thread Updating",
	startup: function () {
		if (!localStorage.getItem("update")) {
			localStorage.setItem("update", "true");
		}
		if (localStorage.getItem("update") != "true") {
			return true;
		}
		if (!document.postform.resto) {return true;}
		var controls = document.createElement("div");
		controls.id = "controls";
		document.querySelector(".thread").nextElementSibling.insertAdjacentElement("afterEnd", controls);
		controls.innerHTML += "<hr>[<a onclick=\"kkupdate.update();return false;\" href=\"\">Update</a>] [<label><input onchange=\"kkupdate.toggleAuto();\" type=\"checkbox\">Auto</label>] <span id=\"update-status\"></span>";
		return true;
	},
	reset: function () {
		document.querySelector("#controls").remove();
	},
	auto: null,
	inc: [5,10,30,60,120,180],
	inci: 0,
	timer: 0,
	update: function () {
		document.querySelector("#update-status").innerText = "Updating...";
		fetch(window.location.href).then(data => {
			if (data.status != 200) {
				document.querySelector("#update-status").innerText = "This thread has been pruned or deleted";
				document.querySelector("#controls input").disabled = true;
				document.querySelector("#controls a").onclick = function () {return false;};
				return true;
			} else {
				data.text().then(text => {
					var d = document.createElement("html");
					d.innerHTML = text;
					var rs = document.querySelectorAll(".reply");
					var lid = 0;
					if (rs) lid = rs[rs.length-1].id.slice(1);
					var frs = d.querySelectorAll(".reply");
					var i;
					for (i = frs.length-1; i > 0; i--)
						if (frs[i].id.slice(1) <= lid)
							break;
					i++;
					var npc = (frs.length) - i;
					if (npc == 0) {
						kkupdate.inci++;
						if (kkupdate.inci >= kkupdate.inc.length)
							kkupdate.inci--;
						document.querySelector("#update-status").innerText = "No new posts";
						return true;
					}
					kkupdate.inci = 0;
					var ptable;
					for (i = i; i <= frs.length-1; i++) {
						document.querySelector(".thread").insertAdjacentElement("beforeEnd", frs[i].parentElement.parentElement.parentElement);
						/* scan for quotes, update backlinks */
						frs[i].querySelectorAll(".comment .quotelink").forEach(function (i) {
							var id = i.innerText.slice(2);
							var lr = document.querySelector("#p"+id);
							var fr = d.querySelector("#p"+id);
							if (lr && fr) {
								lr.querySelector(".backlinks").innerHTML = fr.querySelector(".backlinks").innerHTML;
							}
						});
					}
					document.querySelector("#update-status").innerText = npc+" new post"+(npc>1 ? "s" : "");
					if (kkimg) kkimg.startup();
					if (kkinline) kkinline.startup();
					return true;
				});
			}
		});
	},
	toggleAuto: function () {
		if (kkupdate.auto) {
			clearInterval(kkupdate.auto);
			kkupdate.inci = 0;
			kkupdate.timer = 0;
			document.querySelector("#update-status").innerText = "";
			kkupdate.auto = null;
		} else {
			kkupdate.inci = 0;
			kkupdate.timer = kkupdate.inc[kkupdate.inci];
			kkupdate._timer();
			kkupdate.auto = setInterval(kkupdate._timer, 1000);
		}
	},
	_timer: function () {
		if (kkupdate.timer <= 0) {
			clearInterval(kkupdate.auto);
			kkupdate.update(true);
			kkupdate.timer = kkupdate.inc[kkupdate.inci];
			kkupdate.auto = setInterval(kkupdate._timer, 1000);
		}
		document.querySelector("#update-status").innerText = kkupdate.timer;
		kkupdate.timer -= 1;
	},
	sett: function (tab, div) { if (tab!="general") return;
		div.innerHTML+= `
			<label><input type="checkbox" onchange="localStorage.setItem('update',this.checked);kkupdate.reset();kkupdate.startup();"`+(localStorage.getItem("update")=="true"?'checked="checked"':'')+` />Thread updater</label>
			`;
	}
};

/* Register */
if(typeof(KOKOJS)!="undefined"){kkjs.modules.push(kkupdate);}else{console.log("ERROR: KOKOJS not loaded!\nPlease load 'koko.js' before this script.");}
