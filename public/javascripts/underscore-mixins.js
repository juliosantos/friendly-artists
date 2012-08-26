  _.mixin({
    inGroupsOf: function(array, number, fillWith) {
        fillWith = fillWith || null;
        var index = -number, slices = [];

        if (number < 1) return array;

        while ((index += number) < array.length) {
            var s = array.slice(index, index + number);
            while(s.length < number)
                s.push(fillWith);
            slices.push(s);
        }
        return slices;
    }
  });

