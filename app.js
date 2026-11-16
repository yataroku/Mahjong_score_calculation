// 状態管理
let currentRole = 'ko'; // 'ko' または 'oya'
let activeYaku = new Set();
let activeYakuhai = new Set(); // 選択された役牌のセット
let hasChi = false; // チーをしているかどうか

// プレーヤー（親・子）の切り替え
function setRole(role) {
    currentRole = role;
    const buttons = document.querySelectorAll('.toggle-group .toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    calculateScore();
}

// 鳴き（チー・明刻・明カン）の有無・合計数
function getOpenMentsuCount() {
    if (hasYakuman()) return 0;
    const mKotsu = parseInt(document.getElementById('m-kotsu').innerText) || 0;
    const myKotsu = parseInt(document.getElementById('my-kotsu').innerText) || 0;
    const mKan = parseInt(document.getElementById('m-kan').innerText) || 0;
    const myKan = parseInt(document.getElementById('my-kan').innerText) || 0;
    return (hasChi ? 1 : 0) + mKotsu + myKotsu + mKan + myKan;
}

// 暗刻・暗カンの合計数
function getAnmotsuCount() {
    if (hasYakuman()) return 0;
    const aKotsu = parseInt(document.getElementById('a-kotsu').innerText) || 0;
    const ayKotsu = parseInt(document.getElementById('ay-kotsu').innerText) || 0;
    const aKan = parseInt(document.getElementById('a-kan').innerText) || 0;
    const ayKan = parseInt(document.getElementById('ay-kan').innerText) || 0;
    return aKotsu + ayKotsu + aKan + ayKan;
}

// すべての刻子・カンの合計数
function getTotalKotsuOrKanCount() {
    if (hasYakuman()) return 0;
    const mKotsu = parseInt(document.getElementById('m-kotsu').innerText) || 0;
    const myKotsu = parseInt(document.getElementById('my-kotsu').innerText) || 0;
    const mKan = parseInt(document.getElementById('m-kan').innerText) || 0;
    const myKan = parseInt(document.getElementById('my-kan').innerText) || 0;
    return mKotsu + myKotsu + mKan + myKan + getAnmotsuCount();
}

// 役満かどうかを判定するヘルパー
function hasYakuman() {
    const yakumanList = ['国士無双', '四暗刻', '大三元', '小四喜', '大四喜', '字一色', '清老頭', '緑一色', '九蓮宝燈', '四槓子'];
    for (let y of activeYaku) {
        if (yakumanList.includes(y)) return true;
    }
    return false;
}

// 門前限定役が1つでも選択されているか判定するヘルパー
function hasMenzenOnlyYakuSelected() {
    const menzenOnlyYaku = ['リーチ', '門前ツモ', '一発', '七対子', '一盃口', '二盃口', 'ダブル立直', '平和'];
    for (let y of activeYaku) {
        if (menzenOnlyYaku.includes(y)) return true;
    }
    return false;
}

// 七対子と同時に選べない役の定義
const incompatibleWithChitoitsu = [
    '一気通貫', '三色同順', '小三元', '嶺上開花', '槍槓',
    '対々和', '三暗刻', '三槓子', '一盃口', '二盃口', 'チャンタ', '純チャン',
    '三色同刻', '平和'
];

// 平和と同時に選べない役の定義
const incompatibleWithPinfu = [
    '七対子', '対々和', '混老頭', 'チャンタ', '純チャン',
    '三暗刻', '三槓子', '三色同刻', '小三元', '嶺上開花', '槍槓'
];

// 一気通貫と同時に選べない役の定義
const incompatibleWithIkkitsuukan = [
    'タンヤオ', '三色同順', '二盃口', '三暗刻', '三槓子', '小三元', 'チャンタ', '純チャン', '混老頭'
];

// 三槓子と同時に選べない役の定義
const incompatibleWithSankantsu = [
    '三暗刻', '対々和', '四暗刻', '四槓子', '一盃口', '二盃口', '三色同順'
];

// 三色同順と同時に選べない役の定義
const incompatibleWithSanshokuDojun = [
    '対々和', '三暗刻', '清一色', '混一色', '混老頭', '小三元', '二盃口', '三色同刻'
];

// 三色同刻と同時に選べない役の定義
const incompatibleWithSanshokuDoukoku = [
    '一盃口', '二盃口', '清一色', '混一色', '小三元', '三色同順'
];

// 対々和（トイトイ）と同時に選べない役の定義
const incompatibleWithToitoi = [
    '一盃口', '二盃口'
];

// 三暗刻と同時に選べない役の定義
const incompatibleWithSanankou = [
    '一盃口', '二盃口'
];

// 一盃口と同時に選べない役の定義
const incompatibleWithIipeiko = [
    '混老頭'
];

// 二盃口と同時に選べない役の定義
const incompatibleWithRyanpeiko = [
    '混老頭', '小三元'
];

// 小三元と同時に選べない役の定義
const incompatibleWithShosangen = [
    'タンヤオ', '三色同順', '三色同刻', '二盃口', '清一色', '純チャン'
];

// 混老頭と同時に選べない役の定義
const incompatibleWithHonroutou = [
    'タンヤオ', '三色同順', '一盃口', '二盃口', '純チャン', '清一色', 'チャンタ'
];

// チャンタと同時に選べない役の定義
const incompatibleWithChanta = [
    'タンヤオ', '純チャン', '混老頭', '清一色'
];

// 混一色（ホンイツ）と同時に選べない役の定義
const incompatibleWithHonitsu = [
    'タンヤオ', '純チャン', '清一色'
];

// チーボタンのトグル処理
function toggleChi(btn) {
    if (btn.disabled || hasYakuman()) return;

    // 門前限定役が選ばれている場合はチーを有効化できない
    if (!hasChi && hasMenzenOnlyYakuSelected()) return;

    hasChi = !hasChi;
    if (hasChi) {
        btn.classList.add('active');
        btn.style.background = '#047857';
        btn.style.borderColor = 'var(--primary)';
        btn.innerText = 'チーあり';
    } else {
        btn.classList.remove('active');
        btn.style.background = 'var(--bg-color)';
        btn.style.borderColor = 'var(--border)';
        btn.innerText = 'チーなし';
    }

    updateUIState();
    calculateScore();
}

// ボタンやカウンター、セレクトボックスの活性・非活性を動的に更新する関数
function updateUIState() {
    const hasOpen = getOpenMentsuCount() > 0;
    const hasKotsuOrKan = getTotalKotsuOrKanCount() > 0;
    const isChitoitsu = activeYaku.has('七対子');
    const isPinfu = activeYaku.has('平和');
    const isSanshokuDoukoku = activeYaku.has('三色同刻');
    const isIkkitsuukan = activeYaku.has('一気通貫');
    const isSankantsu = activeYaku.has('三槓子');
    const isChankan = activeYaku.has('槍槓');
    const isSanshokuDojun = activeYaku.has('三色同順');
    const isShosangen = activeYaku.has('小三元');
    const isRinshan = activeYaku.has('嶺上開花');
    const isTanyao = activeYaku.has('タンヤオ');
    const isJunchan = activeYaku.has('純チャン');
    const isChanta = activeYaku.has('チャンタ');
    const isIipeiko = activeYaku.has('一盃口');
    const isRyanpeiko = activeYaku.has('二盃口');
    const isTsumoYaku = activeYaku.has('門前ツモ');
    const isToitoi = activeYaku.has('対々和');
    const isSanankou = activeYaku.has('三暗刻');
    const isHonroutou = activeYaku.has('混老頭');
    const isHonitsu = activeYaku.has('混一色');
    const isChinitsu = activeYaku.has('清一色');
    const isReach = activeYaku.has('リーチ');
    const isWReach = activeYaku.has('ダブル立直');
    const isHaitei = activeYaku.has('海底摸月');
    const isHoutei = activeYaku.has('河底撈魚');
    const isYakumanActive = hasYakuman();
    const isMenzenSelected = hasMenzenOnlyYakuSelected();
    const hasYakuhaiSelected = activeYakuhai.size > 0;
    const hasRenfuhaSelected = activeYakuhai.has('連風牌(2翻)');
    const hasBaifuOrJifuSelected = activeYakuhai.has('場風牌') || activeYakuhai.has('自風牌');
    const machiValue = document.getElementById('machi').value;
    const jantoValue = document.getElementById('janto').value;

    // リーチ中（リーチ または ダブル立直 が選択されているか）
    const isReachActive = activeYaku.has('リーチ') || activeYaku.has('ダブル立直');

    // 待ちセレクトボックスの表示切り替え（通常時 vs リーチ時）
    const defaultOption = document.getElementById('machi-default-option');
    const reachChaoM = document.getElementById('machi-reach-chao-m');
    const reachChaoY = document.getElementById('machi-reach-chao-y');

    if (defaultOption && reachChaoM && reachChaoY) {
        if (isReachActive) {
            defaultOption.innerText = "両面 (0符)"; // リーチ中は「両面」にする
            reachChaoM.style.display = 'block';
            reachChaoY.style.display = 'block';
        } else {
            defaultOption.innerText = "両面・シャンポン待ち (0符)"; // 通常時は「両面・シャボ」に戻す
            reachChaoM.style.display = 'none';
            reachChaoY.style.display = 'none';

            // リーチを解除した際にシャンポン待ちが選ばれていた場合は「両面・シャボ」に戻す
            if (machiValue === '4' || (machiValue === '2' && document.getElementById('machi').options[document.getElementById('machi').selectedIndex].innerText.includes('シャンポン'))) {
                document.getElementById('machi').value = '0';
            }
        }
    }

    const hasAnyIncompatibleWithChitoitsu = Array.from(activeYaku).some(y => incompatibleWithChitoitsu.includes(y));
    const hasAnyIncompatibleWithPinfu = Array.from(activeYaku).some(y => incompatibleWithPinfu.includes(y)) || hasYakuhaiSelected || hasKotsuOrKan || (machiValue === '2' && !isReachActive) || machiValue === '4' || jantoValue === '2' || jantoValue === '4';
    const hasAnyIncompatibleWithIkkitsuukan = Array.from(activeYaku).some(y => incompatibleWithIkkitsuukan.includes(y));
    const hasAnyIncompatibleWithSankantsu = Array.from(activeYaku).some(y => incompatibleWithSankantsu.includes(y));
    const hasAnyIncompatibleWithSanshokuDojun = Array.from(activeYaku).some(y => incompatibleWithSanshokuDojun.includes(y));
    const hasAnyIncompatibleWithSanshokuDoukoku = Array.from(activeYaku).some(y => incompatibleWithSanshokuDoukoku.includes(y));
    const hasAnyIncompatibleWithToitoi = Array.from(activeYaku).some(y => incompatibleWithToitoi.includes(y));
    const hasAnyIncompatibleWithSanankou = Array.from(activeYaku).some(y => incompatibleWithSanankou.includes(y));
    const hasAnyIncompatibleWithIipeiko = Array.from(activeYaku).some(y => incompatibleWithIipeiko.includes(y));
    const hasAnyIncompatibleWithRyanpeiko = Array.from(activeYaku).some(y => incompatibleWithRyanpeiko.includes(y));
    const hasAnyIncompatibleWithShosangen = Array.from(activeYaku).some(y => incompatibleWithShosangen.includes(y));
    const hasAnyIncompatibleWithHonroutou = Array.from(activeYaku).some(y => incompatibleWithHonroutou.includes(y));
    const hasAnyIncompatibleWithChanta = Array.from(activeYaku).some(y => incompatibleWithChanta.includes(y));
    const hasAnyIncompatibleWithHonitsu = Array.from(activeYaku).some(y => incompatibleWithHonitsu.includes(y));

    // 1. 通常の役ボタンごとの排他・選択可否判定
    const yakuButtons = document.querySelectorAll('.yaku-btn:not(.yakuhai-select-btn):not(.toggle-chi-btn)');
    yakuButtons.forEach(btn => {
        const name = btn.innerText.trim();
        let disabled = false;
        const yakumanList = ['国士無双', '四暗刻', '大三元', '小四喜', '大四喜', '字一色', '清老頭', '緑一色', '九蓮宝燈', '四槓子'];
        const isThisBtnYakuman = yakumanList.includes(name);

        const menzenOnlyYaku = ['リーチ', '門前ツモ', '一発', '七対子', '一盃口', '二盃口', 'ダブル立直', '平和'];

        if (isYakumanActive && !isThisBtnYakuman) {
            disabled = true;
        } else {
            if (hasOpen && menzenOnlyYaku.includes(name)) disabled = true;

            // 門前ツモ選択時は対々和を排他
            if (isTsumoYaku && name === '対々和') disabled = true;
            if (isToitoi && name === '門前ツモ') disabled = true;

            // 対々和と一気通貫の相互排他
            if (isToitoi && name === '一気通貫') disabled = true;
            if (isIkkitsuukan && name === '対々和') disabled = true;

            // 対々和と一盃口・二盃口の相互排他
            if (isToitoi && incompatibleWithToitoi.includes(name)) disabled = true;
            if (name === '対々和' && hasAnyIncompatibleWithToitoi) disabled = true;

            // 三暗刻と一盃口・二盃口の相互排他
            if (isSanankou && incompatibleWithSanankou.includes(name)) disabled = true;
            if (name === '三暗刻' && hasAnyIncompatibleWithSanankou) disabled = true;

            // 一盃口・二盃口と混老頭の相互排他
            if (isIipeiko && incompatibleWithIipeiko.includes(name)) disabled = true;
            if (name === '一盃口' && hasAnyIncompatibleWithIipeiko) disabled = true;
            if (isRyanpeiko && incompatibleWithRyanpeiko.includes(name)) disabled = true;
            if (name === '二盃口' && hasAnyIncompatibleWithRyanpeiko) disabled = true;

            // 二盃口選択時は役牌を選べないようにする
            if (isRyanpeiko && (name === '小三元' || hasYakuhaiSelected)) disabled = true;
            if ((name === '二盃口' && (isShosangen || hasYakuhaiSelected))) disabled = true;

            // 清一色選択時は役牌を選べないようにする
            if (isChinitsu && hasYakuhaiSelected) disabled = true;
            if (name === '清一色' && hasYakuhaiSelected) disabled = true;

            // 小三元と他の非両立役の相互排他
            if (isShosangen && incompatibleWithShosangen.includes(name)) disabled = true;
            if (name === '小三元' && hasAnyIncompatibleWithShosangen) disabled = true;

            // 混老頭と他の非両立役の相互排他
            if (isHonroutou && incompatibleWithHonroutou.includes(name)) disabled = true;
            if (name === '混老頭' && hasAnyIncompatibleWithHonroutou) disabled = true;

            // チャンタと他の非両立役の相互排他
            if (isChanta && incompatibleWithChanta.includes(name)) disabled = true;
            if (name === 'チャンタ' && hasAnyIncompatibleWithChanta) disabled = true;

            // 混一色と他の非両立役の相互排他
            if (isHonitsu && incompatibleWithHonitsu.includes(name)) disabled = true;
            if (name === '混一色' && hasAnyIncompatibleWithHonitsu) disabled = true;

            // 三色同順と他の非両立役の相互排他
            if (isSanshokuDojun && incompatibleWithSanshokuDojun.includes(name)) disabled = true;
            if (name === '三色同順' && hasAnyIncompatibleWithSanshokuDojun) disabled = true;

            // 三色同刻と他の非両立役の相互排他
            if (isSanshokuDoukoku && incompatibleWithSanshokuDoukoku.includes(name)) disabled = true;
            if (name === '三色同刻' && hasAnyIncompatibleWithSanshokuDoukoku) disabled = true;

            // 槍槓と対々和・三暗刻の相互排他
            if (isChankan && (name === '対々和' || name === '三暗刻')) disabled = true;
            if ((isToitoi || isSanankou) && name === '槍槓') disabled = true;

            // 一気通貫と他の非両立役の相互排他
            if (isIkkitsuukan && incompatibleWithIkkitsuukan.includes(name)) disabled = true;
            if (name === '一気通貫' && hasAnyIncompatibleWithIkkitsuukan) disabled = true;

            // 三槓子と他の非両立役の相互排他
            if (isSankantsu && incompatibleWithSankantsu.includes(name)) disabled = true;
            if (name === '三槓子' && hasAnyIncompatibleWithSankantsu) disabled = true;
            if (name === '四暗刻' && isSankantsu) disabled = true;
            if (name === '四槓子' && isSankantsu) disabled = true;

            // 一盃口と二盃口の相互排他
            if (isIipeiko && name === '二盃口') disabled = true;
            if (isRyanpeiko && name === '一盃口') disabled = true;

            if (name === '七対子' && hasKotsuOrKan) disabled = true;

            // リーチとダブル立直の相互排他
            if (isReach && name === 'ダブル立直') disabled = true;
            if (isWReach && name === 'リーチ') disabled = true;

            // 一気通貫と三色同刻の相互排他
            if (isIkkitsuukan && name === '三色同刻') disabled = true;
            if (isSanshokuDoukoku && name === '一気通貫') disabled = true;

            // 七対子と他の役の双方向排他
            if (isChitoitsu && incompatibleWithChitoitsu.includes(name)) disabled = true;
            if (name === '七対子' && hasAnyIncompatibleWithChitoitsu) disabled = true;

            // 平和と他の役・条件の双方向排他
            if (isPinfu && incompatibleWithPinfu.includes(name)) disabled = true;
            if (name === '平和' && hasAnyIncompatibleWithPinfu) disabled = true;

            // 門前ツモと河底撈魚の相互排他
            if (isTsumoYaku && name === '河底撈魚') disabled = true;
            if (isHoutei && name === '門前ツモ') disabled = true;

            // 槍槓と同時に選べない役
            if (isChankan && (name === 'ダブル立直' || name === '門前ツモ' || name === '海底摸月' || name === '河底撈魚' || name === '嶺上開花')) disabled = true;
            if ((isWReach || isTsumoYaku || isHaitei || isHoutei || isRinshan) && name === '槍槓') disabled = true;

            // 嶺上開花と同時に選べない役
            if (isRinshan && (name === '海底摸月' || name === '河底撈魚' || name === '槍槓')) disabled = true;
            if ((isHaitei || isHoutei || isChankan) && name === '嶺上開花') disabled = true;

            if (isToitoi && name === '平和') disabled = true;
            if (isChanta && name === '純チャン') disabled = true;
            if (isJunchan && name === 'チャンタ') disabled = true;

            if (isTanyao && (name === '純チャン' || name === '混老頭' || name === 'チャンタ' || name === '小三元' || name === '混一色')) disabled = true;
            if ((isChanta || isJunchan || isShosangen || isHonitsu) && name === 'タンヤオ') disabled = true;

            if (hasYakuhaiSelected && name === 'タンヤオ') disabled = true;
            if (hasYakuhaiSelected && name === '純チャン') disabled = true;

            // 海底摸月と河底撈魚の相互排他
            if (activeYaku.has('海底摸月') && name === '河底撈魚') disabled = true;
            if (activeYaku.has('河底撈魚') && name === '海底摸月') disabled = true;
        }

        if (disabled) {
            btn.disabled = true;
            btn.style.opacity = '0.35';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });

    // チー行・チーボタン自身の有効・無効切り替え
    const chiRow = document.getElementById('chi-row');
    const chiBtn = document.getElementById('chi-btn');
    if (chiRow && chiBtn) {
        if (isYakumanActive || isMenzenSelected || isToitoi || isHonroutou) {
            chiRow.style.opacity = '0.4';
            chiBtn.disabled = true;
            chiBtn.style.cursor = 'not-allowed';
        } else {
            chiRow.style.opacity = '1';
            chiBtn.disabled = false;
            chiBtn.style.cursor = 'pointer';
        }
    }

    // 2. 役牌ボタン・ドラカウンターのロック
    const doraBox = document.getElementById('dora-count').closest('.input-row');
    const yakuhaiBtns = document.querySelectorAll('.yakuhai-select-btn');

    if (isYakumanActive) {
        if (doraBox) doraBox.style.opacity = '0.4';
        document.querySelectorAll('button[onclick*="dora-count"]').forEach(b => b.disabled = true);
        yakuhaiBtns.forEach(b => {
            b.disabled = true;
            b.style.opacity = '0.4';
        });
    } else {
        if (doraBox) doraBox.style.opacity = '1';
        document.querySelectorAll('button[onclick*="dora-count"]').forEach(b => b.disabled = false);
        yakuhaiBtns.forEach(b => {
            const bName = b.innerText.trim();
            let yBtnDisabled = false;

            if (isChinitsu || isRyanpeiko || isPinfu || isChitoitsu || isTanyao || isJunchan) {
                yBtnDisabled = true;
            } else {
                if (hasRenfuhaSelected && (bName === '場風牌' || bName === '自風牌')) yBtnDisabled = true;
                if (hasBaifuOrJifuSelected && bName === '連風牌(2翻)') yBtnDisabled = true;
            }

            if (yBtnDisabled) {
                b.disabled = true;
                b.style.opacity = '0.35';
                b.style.cursor = 'not-allowed';
            } else {
                b.disabled = false;
                b.style.opacity = '1';
                b.style.cursor = 'pointer';
            }
        });
    }

    // 3. 手牌構成（刻子・カン）のロック
    const kotsuRows = document.querySelectorAll('.kotsu-kan-row');
    kotsuRows.forEach(row => {
        const btns = row.querySelectorAll('.counter-btn');
        const isCounterOpen = row.querySelector('[onclick*="m-kotsu"], [onclick*="my-kotsu"], [onclick*="m-kan"], [onclick*="my-kan"]');
        const isYaochuRow = row.querySelector('[onclick*="ay-kotsu"], [onclick*="ay-kan"], [onclick*="my-kotsu"], [onclick*="my-kan"]');

        if (isYakumanActive || isChitoitsu || isPinfu) {
            row.style.opacity = '0.4';
            btns.forEach(b => b.disabled = true);
        } else if (isTanyao && isYaochuRow) {
            row.style.opacity = '0.4';
            btns.forEach(b => b.disabled = true);
        } else if (isMenzenSelected && isCounterOpen) {
            row.style.opacity = '0.4';
            btns.forEach(b => b.disabled = true);
        } else {
            row.style.opacity = '1';
            btns.forEach(b => b.disabled = false);
        }
    });

    // 4. セレクトボックスのロック・連動制御
    const jantoEl = document.getElementById('janto');
    const machiEl = document.getElementById('machi');
    const methodEl = document.getElementById('method');

    if (isYakumanActive) {
        [jantoEl, machiEl, methodEl].forEach(el => {
            if (el) {
                el.disabled = true;
                el.style.opacity = '0.4';
                el.style.cursor = 'not-allowed';
            }
        });
    } else {
        if (isPinfu || isChitoitsu) {
            jantoEl.value = '0';
            jantoEl.disabled = true;
            jantoEl.style.opacity = '0.4';
            jantoEl.style.cursor = 'not-allowed';
        } else {
            jantoEl.disabled = false;
            jantoEl.style.opacity = '1';
            jantoEl.style.cursor = 'pointer';
        }

        if (isPinfu || isChitoitsu) {
            machiEl.value = '0';
            machiEl.disabled = true;
            machiEl.style.opacity = '0.4';
            machiEl.style.cursor = 'not-allowed';
        } else {
            machiEl.disabled = false;
            machiEl.style.opacity = '1';
            machiEl.style.cursor = 'pointer';
        }

        if (isTsumoYaku || isHaitei || isRinshan) {
            methodEl.value = 'tsumo';
            methodEl.disabled = true;
            methodEl.style.opacity = '0.4';
            methodEl.style.cursor = 'not-allowed';
        } else if (isChankan || isHoutei) {
            methodEl.value = 'ron';
            methodEl.disabled = true;
            methodEl.style.opacity = '0.4';
            methodEl.style.cursor = 'not-allowed';
        } else {
            methodEl.disabled = false;
            methodEl.style.opacity = '1';
            methodEl.style.cursor = 'pointer';
        }
    }
}

// 役ボタンのトグル
function toggleYaku(btn) {
    if (btn.disabled) return;

    const yakuName = btn.innerText.trim();
    const isActivating = !btn.classList.contains('active');
    const yakumanList = ['国士無双', '四暗刻', '大三元', '小四喜', '大四喜', '字一色', '清老頭', '緑一色', '九蓮宝燈', '四槓子'];
    const isThisYakuman = yakumanList.includes(yakuName);
    const menzenOnlyYaku = ['リーチ', '門前ツモ', '一発', '七対子', '一盃口', '二盃口', 'ダブル立直', '平和'];

    if (isActivating) {
        if (isThisYakuman) {
            resetChiButton();
            ['m-kotsu', 'my-kotsu', 'a-kotsu', 'ay-kotsu', 'm-kan', 'my-kan', 'a-kan', 'ay-kan'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerText = '0';
            });
            activeYakuhai.clear();
            document.querySelectorAll('.yakuhai-select-btn').forEach(b => b.classList.remove('active'));

            const dCount = document.getElementById('dora-count');
            if (dCount) dCount.innerText = '0';

            activeYaku.clear();
            activeYaku.add(yakuName);
        } else {
            if (menzenOnlyYaku.includes(yakuName) && getOpenMentsuCount() > 0) {
                return;
            }

            if (yakuName === '門前ツモ') {
                document.getElementById('method').value = 'tsumo';
                activeYaku.delete('河底撈魚');
                activeYaku.delete('対々和');
            }

            if (yakuName === '対々和') {
                resetChiButton();
                activeYaku.delete('門前ツモ');
                activeYaku.delete('一気通貫');
                activeYaku.delete('三色同順');
                activeYaku.delete('槍槓');
                incompatibleWithToitoi.forEach(y => activeYaku.delete(y));
            }

            if (incompatibleWithToitoi.includes(yakuName)) {
                activeYaku.delete('対々和');
            }

            if (yakuName === '三暗刻') {
                activeYaku.delete('槍槓');
                activeYaku.delete('三色同順');
                incompatibleWithSanankou.forEach(y => activeYaku.delete(y));
            }

            if (incompatibleWithSanankou.includes(yakuName)) {
                activeYaku.delete('三暗刻');
            }

            if (yakuName === '一盃口') {
                incompatibleWithIipeiko.forEach(y => activeYaku.delete(y));
            }
            if (incompatibleWithIipeiko.includes(yakuName)) {
                activeYaku.delete('一盃口');
            }
            if (yakuName === '二盃口') {
                incompatibleWithRyanpeiko.forEach(y => activeYaku.delete(y));
                activeYakuhai.clear();
                document.querySelectorAll('.yakuhai-select-btn').forEach(b => b.classList.remove('active'));
            }
            if (incompatibleWithRyanpeiko.includes(yakuName)) {
                activeYaku.delete('二盃口');
            }

            if (yakuName === '清一色') {
                activeYakuhai.clear();
                document.querySelectorAll('.yakuhai-select-btn').forEach(b => b.classList.remove('active'));
            }

            if (yakuName === '小三元') {
                incompatibleWithShosangen.forEach(y => activeYaku.delete(y));
            }
            if (incompatibleWithShosangen.includes(yakuName)) {
                activeYaku.delete('小三元');
            }

            if (yakuName === '混老頭') {
                resetChiButton();
                incompatibleWithHonroutou.forEach(y => activeYaku.delete(y));
            }
            if (incompatibleWithHonroutou.includes(yakuName)) {
                activeYaku.delete('混老頭');
            }

            if (yakuName === 'チャンタ') {
                incompatibleWithChanta.forEach(y => activeYaku.delete(y));
            }
            if (incompatibleWithChanta.includes(yakuName)) {
                activeYaku.delete('チャンタ');
            }

            if (yakuName === '混一色') {
                incompatibleWithHonitsu.forEach(y => activeYaku.delete(y));
            }
            if (incompatibleWithHonitsu.includes(yakuName)) {
                activeYaku.delete('混一色');
            }

            if (yakuName === '三色同順') {
                incompatibleWithSanshokuDojun.forEach(y => activeYaku.delete(y));
            }
            if (incompatibleWithSanshokuDojun.includes(yakuName)) {
                activeYaku.delete('三色同順');
            }

            if (yakuName === '三色同刻') {
                incompatibleWithSanshokuDoukoku.forEach(y => activeYaku.delete(y));
            }
            if (incompatibleWithSanshokuDoukoku.includes(yakuName)) {
                activeYaku.delete('三色同刻');
            }

            if (yakuName === '槍槓') {
                document.getElementById('method').value = 'ron';
                ['ダブル立直', '門前ツモ', '海底摸月', '河底撈魚', '嶺上開花', '対々和', '三暗刻'].forEach(y => { activeYaku.delete(y); });
            }

            if (yakuName === '一気通貫') {
                activeYaku.delete('対々和');
                incompatibleWithIkkitsuukan.forEach(y => activeYaku.delete(y));
            }

            if (yakuName === '三槓子') {
                incompatibleWithSankantsu.forEach(y => activeYaku.delete(y));
            }

            if (incompatibleWithIkkitsuukan.includes(yakuName)) {
                activeYaku.delete('一気通貫');
            }

            if (incompatibleWithSankantsu.includes(yakuName)) {
                activeYaku.delete('三槓子');
            }
            if (yakuName === '四暗刻' || yakuName === '四槓子') {
                activeYaku.delete('三槓子');
            }

            if (yakuName === '一盃口') {
                activeYaku.delete('二盃口');
                activeYaku.delete('三色同刻');
                activeYaku.delete('対々和');
                activeYaku.delete('三暗刻');
            }
            if (yakuName === '二盃口') {
                activeYaku.delete('一盃口');
                activeYaku.delete('三色同順');
                activeYaku.delete('三色同刻');
                activeYaku.delete('対々和');
                activeYaku.delete('三暗刻');
            }

            if (yakuName === '河底撈魚') {
                document.getElementById('method').value = 'ron';
                activeYaku.delete('門前ツモ');
                activeYaku.delete('海底摸月');
                activeYaku.delete('嶺上開花');
            }

            if (yakuName === '海底摸月') {
                document.getElementById('method').value = 'tsumo';
                activeYaku.delete('河底撈魚');
                activeYaku.delete('槍槓');
            }

            if (yakuName === '嶺上開花') {
                document.getElementById('method').value = 'tsumo';
                ['海底摸月', '河底撈魚', '槍槓'].forEach(y => { activeYaku.delete(y); });
            }

            if (incompatibleWithChitoitsu.includes(yakuName)) {
                activeYaku.delete('七対子');
            }

            if (incompatibleWithPinfu.includes(yakuName)) {
                activeYaku.delete('平和');
            }

            if (yakuName === 'タンヤオ') {
                activeYaku.delete('混老頭');
                activeYaku.delete('小三元');
                activeYaku.delete('チャンタ');
                activeYaku.delete('純チャン');
                activeYaku.delete('混一色');
            }
            if (yakuName === '小三元') {
                activeYaku.delete('タンヤオ');
                activeYaku.delete('三色同順');
                activeYaku.delete('三色同刻');
                activeYaku.delete('二盃口');
                activeYaku.delete('清一色');
                activeYaku.delete('純チャン');
                activeYakuhai.clear();
                document.querySelectorAll('.yakuhai-select-btn').forEach(b => b.classList.remove('active'));
            }

            if (yakuName === '混一色') {
                activeYaku.delete('タンヤオ');
                activeYaku.delete('純チャン');
                activeYaku.delete('清一色');
                activeYaku.delete('三色同順');
                activeYaku.delete('三色同刻');
            }

            if (yakuName === '清一色') {
                activeYaku.delete('三色同順');
                activeYaku.delete('三色同刻');
                activeYaku.delete('小三元');
                activeYaku.delete('混老頭');
                activeYaku.delete('チャンタ');
                activeYaku.delete('混一色');
            }

            if (yakuName === '純チャン') {
                activeYaku.delete('小三元');
                activeYaku.delete('混老頭');
                activeYaku.delete('チャンタ');
                activeYaku.delete('混一色');
            }

            if (yakuName === '混老頭') {
                activeYaku.delete('清一色');
                activeYaku.delete('純チャン');
                activeYaku.delete('チャンタ');
            }

            if (yakuName === 'チャンタ') {
                activeYaku.delete('混老頭');
                activeYaku.delete('清一色');
                activeYaku.delete('タンヤオ');
            }

            if (['ダブル立直', '門前ツモ', '海底摸月', '嶺上開花'].includes(yakuName)) {
                activeYaku.delete('槍槓');
            }

            if (yakuName === '海底摸月') {
                activeYaku.delete('嶺上開花');
            }

            if (yakuName === 'リーチ') { activeYaku.delete('ダブル立直'); }
            if (yakuName === 'ダブル立直') { activeYaku.delete('リーチ'); }

            if (yakuName === '七対子') {
                incompatibleWithChitoitsu.forEach(y => { activeYaku.delete(y); });
                document.getElementById('janto').value = '0';
                document.getElementById('machi').value = '0';
                resetChiButton();
                ['m-kotsu', 'my-kotsu', 'a-kotsu', 'ay-kotsu', 'm-kan', 'my-kan', 'a-kan', 'ay-kan'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.innerText = '0';
                });
            }

            if (yakuName === '平和') {
                if (getTotalKotsuOrKanCount() > 0 || hasChi) return;
                document.getElementById('machi').value = '0';
                document.getElementById('janto').value = '0';
                incompatibleWithPinfu.forEach(y => { activeYaku.delete(y); });
                activeYakuhai.clear();
                document.querySelectorAll('.yakuhai-select-btn').forEach(b => b.classList.remove('active'));
            }

            if (yakuName === '純チャン') {
                activeYakuhai.clear();
                document.querySelectorAll('.yakuhai-select-btn').forEach(b => b.classList.remove('active'));
            }

            if (yakuName === 'タンヤオ') {
                activeYakuhai.clear();
                document.querySelectorAll('.yakuhai-select-btn').forEach(b => b.classList.remove('active'));
                ['ay-kotsu', 'ay-kan', 'my-kotsu', 'my-kan'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.innerText = '0';
                });
            }

            activeYaku.add(yakuName);
        }
    } else {
        activeYaku.delete(yakuName);
    }

    const yakuButtons = document.querySelectorAll('.yaku-btn:not(.yakuhai-select-btn):not(.toggle-chi-btn)');
    yakuButtons.forEach(b => {
        const name = b.innerText.trim();
        if (activeYaku.has(name)) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    updateUIState();
    calculateScore();
}

function resetChiButton() {
    hasChi = false;
    const chiBtn = document.getElementById('chi-btn');
    if (chiBtn) {
        chiBtn.classList.remove('active');
        chiBtn.style.background = 'var(--bg-color)';
        chiBtn.style.borderColor = 'var(--border)';
        chiBtn.innerText = 'チーなし';
    }
}

// 役牌ボタンのトグル
function toggleYakuhai(btn) {
    if (btn.disabled || hasYakuman() || activeYaku.has('二盃口') || activeYaku.has('清一色')) return;

    const name = btn.innerText.trim();
    const isActivating = !btn.classList.contains('active');

    if (isActivating) {
        activeYaku.delete('平和');
        activeYaku.delete('七対子');
        activeYaku.delete('タンヤオ');
        activeYaku.delete('純チャン');
        document.querySelectorAll('.yaku-btn').forEach(b => {
            const txt = b.innerText.trim();
            if (txt === '平和' || txt === '七対子' || txt === 'タンヤオ' || txt === '純チャン') {
                b.classList.remove('active');
            }
        });

        if (name === '連風牌(2翻)') {
            activeYakuhai.delete('場風牌');
            activeYakuhai.delete('自風牌');
        }
        if (name === '場風牌' || name === '自風牌') {
            activeYakuhai.delete('連風牌(2翻)');
        }

        document.querySelectorAll('.yakuhai-select-btn').forEach(b => {
            const bTxt = b.innerText.trim();
            if (activeYakuhai.has(bTxt)) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        activeYakuhai.add(name);
        btn.classList.add('active');
    } else {
        activeYakuhai.delete(name);
        btn.classList.remove('active');
    }

    updateUIState();
    calculateScore();
}

// カウンターの増減
function changeCount(id, delta, min = 0, max = 12) {
    const isOpenId = id.startsWith('m-') || id.startsWith('my-');
    const isYaochuId = id.includes('ay-') || id.includes('my-');

    if (delta > 0 && activeYaku.has('タンヤオ') && isYaochuId) return;
    if (delta > 0 && isOpenId && hasMenzenOnlyYakuSelected()) return;
    if (id !== 'dora-count' && (hasYakuman() || activeYaku.has('平和'))) return;

    const el = document.getElementById(id);
    if (!el) return;

    let val = parseInt(el.innerText) + delta;
    if (val < min) val = min;
    if (val > max) val = max;
    el.innerText = val;

    if (id !== 'dora-count' && getTotalKotsuOrKanCount() > 0) {
        ['七対子', '平和'].forEach(yaku => {
            if (activeYaku.has(yaku)) activeYaku.delete(yaku);
        });
        const yakuButtons = document.querySelectorAll('.yaku-btn:not(.yakuhai-select-btn):not(.toggle-chi-btn)');
        yakuButtons.forEach(btn => {
            const name = btn.innerText.trim();
            if (['七対子', '平和'].includes(name)) btn.classList.remove('active');
        });
    }

    updateUIState();
    calculateScore();
}

// 雀頭のセレクトボックス変更
document.getElementById('janto').addEventListener('change', function () {
    if ((this.value === '2' || this.value === '4') && activeYaku.has('平和')) {
        activeYaku.delete('平和');
        document.querySelectorAll('.yaku-btn').forEach(b => {
            if (b.innerText.trim() === '平和') b.classList.remove('active');
        });
    }
    calculateScore();
});

// 待ちの形変更
document.getElementById('machi').addEventListener('change', function () {
    if (this.value === '2' && activeYaku.has('平和')) {
        activeYaku.delete('平和');
        document.querySelectorAll('.yaku-btn').forEach(b => {
            if (b.innerText.trim() === '平和') b.classList.remove('active');
        });
    }
    calculateScore();
});

// 和了方式変更
document.getElementById('method').addEventListener('change', function () {
    if (this.value === 'ron' && activeYaku.has('門前ツモ')) {
        activeYaku.delete('門前ツモ');
        document.querySelectorAll('.yaku-btn').forEach(b => {
            if (b.innerText.trim() === '門前ツモ') b.classList.remove('active');
        });
    }
    if (this.value === 'tsumo' && (activeYaku.has('槍槓') || activeYaku.has('河底撈魚'))) {
        activeYaku.delete('槍槓');
        activeYaku.delete('河底撈魚');
        document.querySelectorAll('.yaku-btn').forEach(b => {
            const name = b.innerText.trim();
            if (name === '槍槓' || name === '河底撈魚') b.classList.remove('active');
        });
    }
    if (this.value === 'ron' && (activeYaku.has('海底摸月') || activeYaku.has('嶺上開花'))) {
        activeYaku.delete('海底摸月');
        activeYaku.delete('嶺上開花');
        document.querySelectorAll('.yaku-btn').forEach(b => {
            const name = b.innerText.trim();
            if (name === '海底摸月' || name === '嶺上開花') b.classList.remove('active');
        });
    }
    calculateScore();
});

// すべての条件をリセット
function resetApp() {
    activeYaku.clear();
    activeYakuhai.clear();
    resetChiButton();

    document.querySelectorAll('.yaku-btn').forEach(b => b.classList.remove('active'));

    const counters = ['dora-count', 'honba-count', 'a-kotsu', 'ay-kotsu', 'a-kan', 'ay-kan', 'm-kotsu', 'my-kotsu', 'm-kan', 'my-kan'];
    counters.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = '0';
    });

    document.getElementById('janto').value = '0';
    document.getElementById('janto').disabled = false;
    document.getElementById('janto').style.opacity = '1';

    document.getElementById('machi').value = '0';
    document.getElementById('machi').disabled = false;
    document.getElementById('machi').style.opacity = '1';

    document.getElementById('method').value = 'ron';
    document.getElementById('method').disabled = false;
    document.getElementById('method').style.opacity = '1';

    setOutput("役を選んでください", "-", "theme-default");
    updateUIState();
}

// === メインの計算ロジック ===
function calculateScore() {
    let han = 0;
    const isYakumanActive = hasYakuman();
    const hasOpenMentsu = isYakumanActive ? false : (getOpenMentsuCount() > 0);
    const hasKotsuOrKan = isYakumanActive ? false : (getTotalKotsuOrKanCount() > 0);

    const yakuHanMap = {
        'リーチ': 1,
        '門前ツモ': 1,
        'タンヤオ': 1,
        '平和': 1,
        '一発': 1,
        '三色同順': hasOpenMentsu ? 1 : 2,
        '三色同刻': 2,
        '一気通貫': hasOpenMentsu ? 1 : 2,
        '対々和': 2,
        '七対子': 2,
        '三暗刻': 2,
        '三槓子': 2,
        '一盃口': 1,
        '二盃口': 3,
        '混一色': hasOpenMentsu ? 2 : 3,
        '清一色': hasOpenMentsu ? 5 : 6,
        '小三元': 2,
        '混老頭': 2,
        'チャンタ': hasOpenMentsu ? 1 : 2,
        '純チャン': hasOpenMentsu ? 2 : 3,
        '海底摸月': 1,
        '河底撈魚': 1,
        '嶺上開花': 1,
        '槍槓': 1,
        '国士無双': 13,
        '四暗刻': 13,
        '大三元': 13,
        '小四喜': 13,
        '大四喜': 13,
        '字一色': 13,
        '清老頭': 13,
        '緑一色': 13,
        '九蓮宝燈': 13,
        '四槓子': 13,
        'ダブル立直': 2
    };

    if (isYakumanActive) {
        han = 13;
    } else {
        activeYaku.forEach(yakuName => {
            const menzenOnlyYaku = ['リーチ', '門前ツモ', '一発', '七対子', '一盃口', '二盃口', 'ダブル立直', '平和'];
            if (hasOpenMentsu && menzenOnlyYaku.includes(yakuName)) return;
            if (yakuName === '七対子' && hasKotsuOrKan) return;

            if (yakuHanMap[yakuName] !== undefined) {
                han += yakuHanMap[yakuName];
            } else {
                han += 1;
            }
        });

        activeYakuhai.forEach(yakuhai => {
            if (yakuhai.includes('連風牌')) {
                han += 2;
            } else {
                han += 1;
            }
        });

        const doraCount = parseInt(document.getElementById('dora-count').innerText) || 0;
        han += doraCount;
    }

    if (han === 0) {
        setOutput("役を選んでください", "-", "theme-default");
        updateUIState();
        return;
    }

    let fu = 20;
    const method = idVal('method');
    const isChitoitsuValid = activeYaku.has('七対子') && !hasKotsuOrKan;

    if (isYakumanActive) {
        han = 13;
    } else if (isChitoitsuValid) {
        fu = 25;
    } else {
        if (method === 'ron') {
            if (!hasOpenMentsu) {
                fu += 10;
            }
        } else {
            fu += 2;
        }

        fu += parseInt(idVal('janto'));
        fu += parseInt(idVal('machi'));

        fu += parseInt(idVal('m-kotsu')) * 2;
        fu += parseInt(idVal('my-kotsu')) * 4;
        fu += parseInt(idVal('a-kotsu')) * 4;
        fu += parseInt(idVal('ay-kotsu')) * 8;

        fu += parseInt(idVal('m-kan')) * 8;
        fu += parseInt(idVal('my-kan')) * 16;
        fu += parseInt(idVal('a-kan')) * 16;
        fu += parseInt(idVal('ay-kan')) * 32;

        if (activeYaku.has('平和') && method === 'tsumo') {
            fu = 20;
        } else {
            fu = Math.ceil(fu / 10) * 10;
            if (fu < 30) fu = 30;
        }
    }

    const scoreResult = getMahjongScore(currentRole, han, fu, method, isChitoitsuValid);

    const roleStr = currentRole === 'oya' ? '親' : '子';
    const methodStr = method === 'ron' ? 'ロン' : 'ツモ';
    const topSubText = `${isYakumanActive ? '役満' : (isChitoitsuValid ? '25' : fu) + '符 ' + han + '翻'} (${roleStr}・${methodStr}${scoreResult.level ? ' / ' + scoreResult.level : ''})`;

    setOutput(scoreResult.display, topSubText, scoreResult.themeClass);
    updateUIState();
}

function idVal(id) {
    const el = document.getElementById(id);
    return el.classList && el.classList.contains('counter-value') ? el.innerText : el.value;
}

function setOutput(score, sub, themeClass) {
    document.getElementById('scoreOutput').innerText = score;
    document.getElementById('scoreDetail').innerText = sub;
    document.getElementById('scoreLabel').innerText = '計算結果';

    const resultSection = document.getElementById('resultSection');
    resultSection.className = 'result-section ' + themeClass;
}

function getMahjongScore(role, han, fu, method, isChitoitsuValid) {
    let level = "";
    let themeClass = "theme-default";

    // 本場の数を取得（1本場につき 300点）
    let honba = parseInt(idVal('honba-count')) || 0;
    let honbaScore = honba * 300;

    if (han >= 13) { 
        level = "役満"; 
        themeClass = "theme-yakuman";
    }
    else if (han >= 11) { 
        level = "三倍満"; 
        themeClass = "theme-baiman";
    }
    else if (han >= 8) { 
        level = "倍満"; 
        themeClass = "theme-baiman";
    }
    else if (han >= 6) { 
        level = "跳満"; 
        themeClass = "theme-hanchan";
    }
    else if (han >= 5 || (han === 4 && (fu >= 40 || (fu === 30 && method === 'tsumo'))) || (han === 3 && fu >= 70)) {
        level = "満貫";
        themeClass = "theme-mangan";
    }

    if (level !== "") {
        const res = calculateManganScore(role, level, method, honba);
        return { ...res, level, themeClass };
    }

    let fuParam = isChitoitsuValid ? 25 : fu;
    let base = fuParam * Math.pow(2, han + 2);

    if ((role === 'ko' && base > 2000) || (role === 'oya' && base > 3000)) {
        const res = calculateManganScore(role, "満貫", method, honba);
        return { ...res, level: "満貫", themeClass: "theme-mangan" };
    }

    let ronScore, tsumoKo, tsumoOya;
    if (role === 'oya') {
        ronScore = Math.ceil((base * 6) / 100) * 100 + honbaScore;
        // 親ツモの場合、全員から (base*2 + 100点*本場) ずつ（Mリーグや一般的なルールでは 1本場につき各人＋100点＝合計300点）
        let tsumoOyaEach = Math.ceil((base * 2) / 100) * 100 + (honba * 100);
        
        if (method === 'ron') {
            return {
                display: `${ronScore.toLocaleString()}点`,
                detail: `ロン和了${honba > 0 ? ' (' + honba + '本場: +' + honbaScore + '点)' : ''}`,
                level: "",
                themeClass: "theme-default"
            };
        } else {
            return {
                display: `${tsumoOyaEach.toLocaleString()}点オール`,
                detail: `ツモ各 ${tsumoOyaEach.toLocaleString()}点${honba > 0 ? ' (' + honba + '本場込)' : ''}`,
                level: "",
                themeClass: "theme-default"
            };
        }
    } else {
        ronScore = Math.ceil((base * 4) / 100) * 100 + honbaScore;
        tsumoKo = Math.ceil((base * 1) / 100) * 100 + (honba * 100);
        tsumoOya = Math.ceil((base * 2) / 100) * 100 + (honba * 100);
        
        if (method === 'ron') {
            return { 
                display: `${ronScore.toLocaleString()}点`, 
                detail: `ロン和了${honba > 0 ? ' (' + honba + '本場: +' + honbaScore + '点)' : ''}`, 
                level: "", 
                themeClass: "theme-default" 
            };
        } else {
            return { 
                display: `${tsumoKo.toLocaleString()} / ${tsumoOya.toLocaleString()}点`, 
                detail: `子:${tsumoKo} / 親:${tsumoOya}${honba > 0 ? ' (' + honba + '本場込)' : ''}`, 
                level: "", 
                themeClass: "theme-default" 
            };
        }
    }
}

function calculateManganScore(role, level, method, honba) {
    let honbaScore = honba * 300;
    const table = {
        "満貫": { koRon: 8000, oyaRon: 12000, koTsumoKo: 2000, koTsumoOya: 4000, oyaTsumo: 4000 },
        "跳満": { koRon: 12000, oyaRon: 18000, koTsumoKo: 3000, koTsumoOya: 6000, oyaTsumo: 6000 },
        "倍満": { koRon: 16000, oyaRon: 24000, koTsumoKo: 4000, koTsumoOya: 8000, oyaTsumo: 8000 },
        "三倍満": { koRon: 24000, oyaRon: 36000, koTsumoKo: 6000, koTsumoOya: 12000, oyaTsumo: 12000 },
        "役満": { koRon: 32000, oyaRon: 48000, koTsumoKo: 8000, koTsumoOya: 16000, oyaTsumo: 16000 }
    };
    const t = table[level];
    let h100 = honba * 100;

    if (role === 'oya') {
        if (method === 'ron') {
            return { display: `${(t.oyaRon + honbaScore).toLocaleString()}点`, detail: `${level}${honba > 0 ? ' (' + honba + '本場)' : ''}` };
        }
        let tsumoVal = t.oyaTsumo + h100;
        return { display: `${tsumoVal.toLocaleString()}点オール`, detail: `${level}・ツモ${honba > 0 ? ' (' + honba + '本場)' : ''}` };
    } else {
        if (method === 'ron') {
            return { display: `${(t.koRon + honbaScore).toLocaleString()}点`, detail: `${level}${honba > 0 ? ' (' + honba + '本場)' : ''}` };
        }
        let k = t.koTsumoKo + h100;
        let o = t.koTsumoOya + h100;
        return { display: `${k.toLocaleString()} / ${o.toLocaleString()}点`, detail: `${level}・ツモ${honba > 0 ? ' (' + honba + '本場)' : ''}` };
    }
}

// 初期化実行
updateUIState();