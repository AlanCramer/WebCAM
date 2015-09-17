

// g(i) = G(i, y) for some fixed y
// Sep(i, u) = (u^2 - i^2 +g(u)^2-g(i)^2) div (2(u-i))  where div is integer division
//  int Sep(const AcImage& G, unsigned int y, int i, int u)
function Sep(G, y, i, u) {

    "use strict";
    return Math.floor((u * u - i * i + G.getAt(u, y) * G.getAt(u, y) - G.getAt(i, y) * G.getAt(i, y)) / (2 * (u - i)));
}

// f using EDT is: f(x, i) = (x-i)^2 + g(i)^2
//int EDT_f(const AcImage& G, unsigned int y, int x, int i)
function EDT_f(G, y, x, i) {

    "use strict";
    return (x - i) * (x - i) + G.getAt(i, y) * G.getAt(i, y);
}

//void DistTransUtil::ComputeDistTrans(const AcImage &in, AcImage &dt)
// Meijster algorithm, e.g.
// http://iwi.eldoc.ub.rug.nl/FILES/root/2002/CompImagVisMeijster/2002CompImagVisMeijster.pdf
// todo: error checking, what if inImg is not an image, what if it's not the same size as dt?
// this expects binary images - distance to black is 0, any non black is the same as white
function computeDistTrans(inGreyImg, dt) {

    "use strict";
    var g, m, n, maxGVal, i, j, q, s, t, u, w;

    g = new AcGrey16Image(inGreyImg.width, inGreyImg.height);
//    g = $.extend(g, (JSON.parse(JSON.stringify(inGreyImg)))); // copies the buffer

    m = inGreyImg.width;
    n = inGreyImg.height;

    maxGVal = m + n;

    // phase 1 - define g(i,j)
    //  todo - last column is uninitialized, what should it be?
    for (i = 0; i < m; i += 1) {
        // todo why is this a ref error (invalid lhs) ? g.getAt(i, 0) = ...
        //g.data[i] = (inGreyImg.getAt(i, 0) === 0) ? 0 : maxGVal;
        g.data[i] = (inGreyImg.getAt(i, 0) === 0) ? 0 : maxGVal;

        for (j = 1; j < n; j += 1) {
            g.data[j * g.width + i] = (inGreyImg.getAt(i, j) === 0) ? 0 : 1 + g.getAt(i, j - 1);
        }

        for (j = n - 1; j >= 0; j -= 1) {
            if (g.getAt(i, j+1) < g.getAt(i,j)) {
                g.data[j * g.width + i] = 1 + g.getAt(i, j + 1);
            }
        }
    }
    
    // Phase 2
    // need f and Sep (defined above)

    // todo, this loop could be parallelized
    for (j = 0; j < n; ++j) {
        q = 0;
        s = [];
        t = [];

        s[0] = 0;
        t[0] = 0;

        for (u = 1; u < m; ++u) {
            while (q >=0 && EDT_f(g, j, t[q], s[q]) > EDT_f(g, j, t[q], u)) {
                --q;
            }

            if (q < 0) {
                q = 0;
                s[0] = u;
            }
            else {
                w = 1 + Sep(g, j, s[q], u);
                if (w < m) {
                    ++q;
                    s[q] = u;
                    t[q] = w;
                }
            }
        }

        for (u = m; u >=0; --u) {
            //dt(u, j) = ...
            // todo - how to encapsulate  the lhs?
            dt.data[j*dt.width + u] = EDT_f(g, j, u, s[q]);
            if (u === t[q]) {
                --q;
            }
        }
    }
}
    

